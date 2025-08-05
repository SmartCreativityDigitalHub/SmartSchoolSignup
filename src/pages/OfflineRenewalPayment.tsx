import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Building2, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OfflineRenewalPayment = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phoneNumber: "",
    totalAmount: "",
    paymentDate: "",
    notes: "",
    paymentMethod: "bank_transfer"
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setEvidenceFile(file);
    }
  };

  const uploadEvidence = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `renewal-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('payment-evidence')
        .upload(fileName, file);

      if (error) throw error;
      return data.path;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName || !formData.email || !formData.phoneNumber || 
        !formData.totalAmount || !formData.paymentDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let evidenceUrl = null;
      
      if (evidenceFile) {
        evidenceUrl = await uploadEvidence(evidenceFile);
        if (!evidenceUrl) {
          throw new Error("Failed to upload payment evidence");
        }
      }

      const { error } = await supabase
        .from('offline_subscription_renewals' as any)
        .insert({
          school_name: formData.schoolName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          selected_plan: "renewal",
          total_amount: parseFloat(formData.totalAmount),
          payment_date: formData.paymentDate,
          payment_method: formData.paymentMethod,
          notes: formData.notes || null,
          payment_evidence_url: evidenceUrl
        });

      if (error) throw error;

      toast({
        title: "Renewal Submitted",
        description: "Your offline renewal payment has been submitted successfully. We will review and process it soon.",
      });

      // Reset form
      setFormData({
        schoolName: "",
        email: "",
        phoneNumber: "",
        totalAmount: "",
        paymentDate: "",
        notes: "",
        paymentMethod: "bank_transfer"
      });
      setEvidenceFile(null);
      
      navigate('/renewal-success');
      
    } catch (error: any) {
      console.error('Error submitting renewal:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit renewal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Offline Subscription Renewal</h1>
            <p className="text-muted-foreground">
              Submit your bank transfer payment evidence for subscription renewal
            </p>
          </div>
        </div>

        {/* Bank Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Transfer Details
            </CardTitle>
            <CardDescription>
              Please transfer to the following bank account and upload evidence below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="font-semibold">Bank Name:</Label>
              <p>First Bank Nigeria</p>
            </div>
            <div>
              <Label className="font-semibold">Account Number:</Label>
              <p>1234567890</p>
            </div>
            <div>
              <Label className="font-semibold">Account Name:</Label>
              <p>SchoolTech Solutions Ltd</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Renewal Information
            </CardTitle>
            <CardDescription>
              Provide renewal details and upload payment evidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange("schoolName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Amount Paid (₦) *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                    placeholder="Enter amount paid"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-1">

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional information about the payment..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Upload Payment Evidence</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="evidence"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload receipt, transfer slip, or screenshot. Max 10MB (JPG, PNG, PDF)
                </p>
                {evidenceFile && (
                  <p className="text-sm text-green-600">
                    ✓ File selected: {evidenceFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Renewal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfflineRenewalPayment;