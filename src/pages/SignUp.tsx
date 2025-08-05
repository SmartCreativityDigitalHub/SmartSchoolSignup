import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignUpFormData {
  schoolName: string;
  adminName: string;
  email: string;
  mobileNo: string;
  city: string;
  state: string;
  address?: string;
  referralCode?: string;
  employeeName: string;
  employeeGender?: string;
  employeeReligion?: string;
  employeeBloodGroup?: string;
  employeeDob?: string;
  employeeMobile: string;
  employeeEmail: string;
  employeeAddress: string;
  paymentType: "online" | "offline";
}

interface SignUpProps {
  pricingData?: {
    students: number;
    plan: string;
    discount: number;
    total: number;
  };
}

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pricingData = location.state?.pricingData;
  
  const form = useForm<SignUpFormData>({
    defaultValues: {
      paymentType: "online",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (!pricingData) {
      toast.error("No pricing data available. Please go back and select your plan.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert signup data into database
      const { data: signupRecord, error } = await supabase
        .from("school_signups")
        .insert([{
          school_name: data.schoolName,
          admin_name: data.adminName,
          email: data.email,
          mobile_no: data.mobileNo,
          city: data.city,
          state: data.state,
          address: data.address,
          referral_code: data.referralCode,
          employee_name: data.employeeName,
          employee_gender: data.employeeGender,
          employee_religion: data.employeeReligion,
          employee_blood_group: data.employeeBloodGroup,
          employee_dob: data.employeeDob ? new Date(data.employeeDob).toISOString().split('T')[0] : null,
          employee_mobile: data.employeeMobile,
          employee_email: data.employeeEmail,
          employee_address: data.employeeAddress,
          student_count: pricingData.students,
          selected_plan: pricingData.plan,
          total_amount: pricingData.total,
          payment_type: data.paymentType,
        }])
        .select()
        .single();

      if (error) throw error;

      // Store signup ID for payment process
      localStorage.setItem("signupId", signupRecord.id);
      
      // Send welcome email to multiple recipients
      try {
        const emailRecipients = [
          "signup@smartschool.sch.ng",
          "support@smartschool.sch.ng", 
          "smartcreativitydigitalhub@gmail.com",
          "ezesamuelchinonso688@gmail.com",
          data.email, // School admin email
          data.employeeEmail // Employee email
        ];

        await supabase.functions.invoke('send-email', {
          body: {
            to: emailRecipients,
            subject: 'Welcome to SmartSchool - Registration Successful!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">Welcome to SmartSchool!</h1>
                <p>Dear ${data.adminName},</p>
                <p>Thank you for registering <strong>${data.schoolName}</strong> with SmartSchool!</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2>Registration Summary:</h2>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>School:</strong> ${data.schoolName}</li>
                    <li><strong>Admin:</strong> ${data.adminName}</li>
                    <li><strong>Email:</strong> ${data.email}</li>
                    <li><strong>Phone:</strong> ${data.mobileNo}</li>
                    <li><strong>Address:</strong> ${data.address}</li>
                    <li><strong>City:</strong> ${data.city}</li>
                    <li><strong>State:</strong> ${data.state}</li>
                    <li><strong>Employee:</strong> ${data.employeeName}</li>
                    <li><strong>Employee Email:</strong> ${data.employeeEmail}</li>
                    <li><strong>Employee Phone:</strong> ${data.employeeMobile}</li>
                    <li><strong>Students:</strong> ${pricingData.students.toLocaleString()}</li>
                    <li><strong>Plan:</strong> ${pricingData.plan.charAt(0).toUpperCase() + pricingData.plan.slice(1)}</li>
                    <li><strong>Total Amount:</strong> ₦${pricingData.total.toLocaleString()}</li>
                    <li><strong>Payment Method:</strong> ${data.paymentType === 'online' ? 'Online (Paystack)' : 'Offline (Bank Transfer)'}</li>
                  </ul>
                </div>
                
                ${data.paymentType === 'offline' ? `
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Next Steps for Bank Transfer:</h3>
                    <p>Please proceed with your payment using the bank details provided in your offline payment page.</p>
                    <p>Once payment is made, submit your payment evidence through the system.</p>
                  </div>
                ` : `
                  <p>Your online payment is being processed. You'll receive confirmation once completed.</p>
                `}
                
                <p>We're excited to help transform your school management experience!</p>
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    The SmartSchool Team<br>
                    <a href="mailto:support@smartschool.sch.ng">support@smartschool.sch.ng</a>
                  </p>
                </div>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the registration if email fails
      }
      
      toast.success("Registration successful!");

      // Redirect based on payment type
      if (data.paymentType === "online") {
        // Initialize Paystack payment
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-paystack-payment', {
            body: {
              email: data.email,
              amount: pricingData.total,
              reference: `SS_${signupRecord.id}_${Date.now()}`,
              callback_url: `${window.location.origin}/payment-success`,
              metadata: {
                signup_id: signupRecord.id,
                school_name: data.schoolName,
                plan: pricingData.plan,
                students: pricingData.students,
              },
            },
          });

          if (paymentError) {
            throw paymentError;
          }

          if (paymentData?.data?.authorization_url) {
            // Redirect to Paystack payment page
            window.location.href = paymentData.data.authorization_url;
          } else {
            throw new Error("Failed to get payment URL");
          }
        } catch (paymentError) {
          console.error("Payment initialization error:", paymentError);
          toast.error("Failed to initialize payment. Please try again or use offline payment.");
        }
      } else {
        // For offline payment, redirect to bank details page
        navigate("/offline-payment");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting your registration. Please try again.");
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
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              ← Back to Pricing
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-bg bg-clip-text text-transparent">
            Complete Your Registration
          </h1>
          <p className="text-xl text-muted-foreground">
            Fill in your details to get started with SmartSchool
          </p>
        </div>

        {/* Pricing Summary Card */}
        {pricingData && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="font-semibold">{pricingData.students.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-semibold capitalize">{pricingData.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="font-semibold text-green-600">{formatCurrency(pricingData.discount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-bold text-xl text-primary">{formatCurrency(pricingData.total)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* School Information */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    name="adminName"
                    rules={{ required: "Admin name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter admin name" {...field} />
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
                    name="mobileNo"
                    rules={{ required: "Mobile number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile No *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      rules={{ required: "City is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      rules={{ required: "State is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter referral code (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Employee Details */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employeeName"
                    rules={{ required: "Employee name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="employeeGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeReligion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter religion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="employeeBloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter blood group" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeDob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="employeeMobile"
                    rules={{ required: "Employee mobile is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile No *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeEmail"
                    rules={{ 
                      required: "Employee email is required",
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
                    name="employeeAddress"
                    rules={{ required: "Employee address is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Present Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter present address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Payment Type Selection */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Payment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online">💳 Online (Paystack)</SelectItem>
                          <SelectItem value="offline">🏦 Offline (Bank transfer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-semibold gradient-bg hover:opacity-90 transition-smooth shadow-elegant hover:shadow-glow"
            >
              {isSubmitting ? "Processing..." : "Sign Up & Pay"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUp;