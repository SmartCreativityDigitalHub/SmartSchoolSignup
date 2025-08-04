import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

interface PaymentEvidenceData {
  schoolName: string;
  schoolPhone: string;
  email: string;
  paymentDate: string;
  paymentRef: string;
  amountPaid: number;
  evidenceFile?: FileList;
}

const OfflinePayment = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const form = useForm<PaymentEvidenceData>();

  const bankDetails = {
    accountNumber: "1026921221",
    accountName: "Smart Creativity Digital Hub",
    bankName: "United Bank for Africa (UBA)",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const onSubmit = async (data: PaymentEvidenceData) => {
    setIsSubmitting(true);
    
    try {
      const signupId = localStorage.getItem("signupId");
      
      if (!signupId) {
        toast.error("No signup record found. Please complete registration first.");
        return;
      }

      // Insert payment evidence into database
      const { error } = await supabase
        .from("payment_evidence")
        .insert([{
          signup_id: signupId,
          school_name: data.schoolName,
          school_phone: data.schoolPhone,
          email: data.email,
          payment_date: data.paymentDate,
          payment_ref: data.paymentRef,
          amount_paid: data.amountPaid,
          // Note: File upload would require storage setup
          evidence_file_url: null,
        }]);

      if (error) throw error;

      toast.success("Payment evidence submitted successfully!");
      navigate("/payment-success");
    } catch (error) {
      console.error("Error submitting payment evidence:", error);
      toast.error("An error occurred while submitting your payment evidence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent">
            Complete Your Payment
          </h1>
          <p className="text-xl text-muted-foreground">
            Transfer to our bank account and submit payment evidence
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Bank Account Details */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Company Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Account Number</Label>
                    <p className="text-xl font-bold text-primary">{bankDetails.accountNumber}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                    className="transition-smooth"
                  >
                    {copiedField === "Account Number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Account Name</Label>
                    <p className="text-lg font-semibold">{bankDetails.accountName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                    className="transition-smooth"
                  >
                    {copiedField === "Account Name" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Bank</Label>
                    <p className="text-lg font-semibold">{bankDetails.bankName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                    className="transition-smooth"
                  >
                    {copiedField === "Bank Name" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  ✅ Please use your school name as the payment reference to help us identify your payment quickly.
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  📞 For support, kindly contact us: +234 906 869 1062
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Evidence Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Submit Payment Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schoolName"
                    rules={{ required: "School name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schoolPhone"
                    rules={{ required: "School phone number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Phone No *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    rules={{ required: "Payment date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentRef"
                    rules={{ required: "Payment reference is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Ref *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter payment reference number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amountPaid"
                    rules={{ 
                      required: "Amount paid is required",
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount paid"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evidenceFile"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Upload Evidence</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Upload receipt, screenshot, or bank statement (JPG, PNG, PDF)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold gradient-bg hover:opacity-90 transition-smooth shadow-elegant hover:shadow-glow"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Payment Evidence"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfflinePayment;