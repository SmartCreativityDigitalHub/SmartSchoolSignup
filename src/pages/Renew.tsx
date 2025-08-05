import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Users, School } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface DiscountCode {
  id: string;
  code_number: string;
  code_type: 'percentage' | 'flat';
  percentage?: number;
  flat_amount?: number;
  usage_count_per_email: number;
}

const Renew = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    studentCount: "",
    schoolName: "",
    phoneNumber: "",
    email: "",
    selectedPlan: "starter",
    paymentMethod: "online"
  });

  const planPrices = {
    starter: 1000,
    standard: 2000
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePricing = () => {
    const students = parseInt(formData.studentCount) || 0;
    const basePrice = planPrices[formData.selectedPlan as keyof typeof planPrices] || 0;
    const baseAmount = students * basePrice;
    
    let discountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.code_type === 'percentage') {
        discountAmount = (baseAmount * (appliedDiscount.percentage || 0)) / 100;
      } else {
        discountAmount = appliedDiscount.flat_amount || 0;
      }
    }
    
    const totalAmount = baseAmount - discountAmount;
    
    return {
      students,
      plan: formData.selectedPlan,
      baseAmount,
      discountAmount,
      totalAmount: Math.max(0, totalAmount)
    };
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountError("");
    
    try {
      // Check if discount code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code_number', discountCode.trim())
        .eq('is_active', true)
        .gte('expiration_date', new Date().toISOString().split('T')[0])
        .single();

      if (codeError || !codeData) {
        setDiscountError("Invalid or expired discount code");
        return;
      }

      // Check usage count for this email
      const { data: usageData, error: usageError } = await supabase
        .from('discount_code_usage')
        .select('*')
        .eq('discount_code_id', codeData.id)
        .eq('email', formData.email);

      if (usageError) {
        setDiscountError("Error validating discount code");
        return;
      }

      if (usageData && usageData.length >= codeData.usage_count_per_email) {
        setDiscountError("Discount code usage limit exceeded for this email");
        return;
      }

      setAppliedDiscount({
        id: codeData.id,
        code_number: codeData.code_number,
        code_type: codeData.code_type as 'percentage' | 'flat',
        percentage: codeData.percentage,
        flat_amount: codeData.flat_amount,
        usage_count_per_email: codeData.usage_count_per_email
      });
      toast({
        title: "Discount Applied",
        description: `${codeData.code_type === 'percentage' ? `${codeData.percentage}% discount` : `₦${codeData.flat_amount} discount`} applied successfully!`,
      });

    } catch (error) {
      console.error('Discount validation error:', error);
      setDiscountError("Error validating discount code");
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const handleRenew = async () => {
    if (!formData.studentCount || !formData.schoolName || !formData.phoneNumber || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const pricing = calculatePricing();
    
    if (pricing.students <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid number of students",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create renewal record
      const renewalData = {
        student_count: pricing.students,
        school_name: formData.schoolName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        selected_plan: formData.selectedPlan,
        base_amount: pricing.baseAmount,
        discount_code_id: appliedDiscount?.id || null,
        discount_amount: pricing.discountAmount,
        total_amount: pricing.totalAmount
      };

      const { data: renewalRecord, error: renewalError } = await supabase
        .from('renewals')
        .insert(renewalData)
        .select()
        .single();

      if (renewalError) throw renewalError;

      // Track discount code usage if applied
      if (appliedDiscount) {
        const { error: usageError } = await supabase
          .from('discount_code_usage')
          .insert({
            discount_code_id: appliedDiscount.id,
            email: formData.email
          });

        if (usageError) {
          console.error('Usage tracking error:', usageError);
        }
      }

      let paymentData = null;
      
      // Only initiate Paystack payment for online method
      if (formData.paymentMethod === 'online') {
        const { data: paystackData, error: paymentError } = await supabase.functions.invoke('create-paystack-payment', {
          body: {
            email: formData.email,
            amount: pricing.totalAmount,
            reference: `REN_${renewalRecord.id}_${Date.now()}`,
            callback_url: `${window.location.origin}/renewal-success`,
            metadata: {
              renewal_id: renewalRecord.id,
              school_name: formData.schoolName,
              student_count: pricing.students,
              plan: formData.selectedPlan
            }
          }
        });

        if (paymentError) throw paymentError;
        paymentData = paystackData;

        // Update renewal with payment reference
        await supabase
          .from('renewals')
          .update({ payment_reference: paystackData.data?.reference })
          .eq('id', renewalRecord.id);
      }

      // Send email notification
      await supabase.functions.invoke('send-email', {
        body: {
          to: 'support@smartschool.sch.ng',
          subject: 'New Subscription Renewal Request',
          html: `
            <h2>New Subscription Renewal</h2>
            <p><strong>School Name:</strong> ${formData.schoolName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phoneNumber}</p>
            <p><strong>Students:</strong> ${pricing.students}</p>
            <p><strong>Plan:</strong> ${formData.selectedPlan}</p>
            <p><strong>Payment Method:</strong> ${formData.paymentMethod}</p>
            <p><strong>Base Amount:</strong> ${formatCurrency(pricing.baseAmount)}</p>
            ${appliedDiscount ? `<p><strong>Discount Applied:</strong> ${appliedDiscount.code_number} (-${formatCurrency(pricing.discountAmount)})</p>` : ''}
            <p><strong>Total Amount:</strong> ${formatCurrency(pricing.totalAmount)}</p>
            <p><strong>Payment Reference:</strong> ${paymentData?.reference || 'Offline Payment'}</p>
          `
        }
      });

      // Handle payment method
      if (formData.paymentMethod === 'online') {
        // Redirect to Paystack for online payment
        if (paymentData.data?.authorization_url) {
          window.location.href = paymentData.data.authorization_url;
        }
      } else {
        // Store renewal ID and redirect to offline payment
        localStorage.setItem('renewalId', renewalRecord.id);
        localStorage.setItem('renewalAmount', pricing.totalAmount.toString());
        navigate('/offline-payment');
      }

    } catch (error: any) {
      console.error('Renewal error:', error);
      toast({
        title: "Error",
        description: "Failed to process renewal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Renew Subscription</h1>
            <p className="text-lg text-muted-foreground">
              Continue enjoying SmartSchool with renewed access
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Renewal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Renewal Information
                </CardTitle>
                <CardDescription>
                  Fill in your school details for subscription renewal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="studentCount">Number of Students *</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => handleInputChange('studentCount', e.target.value)}
                    placeholder="Enter number of students"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    placeholder="Enter your school name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="selectedPlan">Select Plan *</Label>
                  <Select value={formData.selectedPlan} onValueChange={(value) => handleInputChange('selectedPlan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter Plan (₦1,000 per student)</SelectItem>
                      <SelectItem value="standard">Standard Plan (₦2,000 per student)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">Online Payment via Paystack</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline">Offline Payment (Bank Transfer)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Discount Code Section */}
                <div className="space-y-2">
                  <Label htmlFor="discountCode">Discount Code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discountCode"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      disabled={!!appliedDiscount}
                    />
                    {!appliedDiscount ? (
                      <Button type="button" onClick={validateDiscountCode} variant="outline">
                        Apply
                      </Button>
                    ) : (
                      <Button type="button" onClick={removeDiscount} variant="outline">
                        Remove
                      </Button>
                    )}
                  </div>
                  {discountError && (
                    <p className="text-sm text-destructive">{discountError}</p>
                  )}
                  {appliedDiscount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary">
                        {appliedDiscount.code_number} - {appliedDiscount.code_type === 'percentage' 
                          ? `${appliedDiscount.percentage}% off` 
                          : `₦${appliedDiscount.flat_amount} off`}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Renewal Summary
                </CardTitle>
                <CardDescription>
                  Review your renewal details and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Students: {pricing.students || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formData.selectedPlan || "No plan selected"}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>{formatCurrency(pricing.baseAmount)}</span>
                  </div>
                  
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(pricing.totalAmount)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleRenew}
                  className="w-full"
                  disabled={isProcessing || !formData.studentCount || !formData.schoolName || !formData.phoneNumber || !formData.email}
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You will be redirected to our secure payment gateway to complete the transaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Renew;