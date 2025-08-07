import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const affiliateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  country: z.string().min(2, "Country is required"),
  stateLocation: z.string().min(2, "State/Location is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bankAccountName: z.string().min(2, "Account name is required"),
  bankAccountNumber: z.string().min(10, "Valid account number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AffiliateFormData = z.infer<typeof affiliateSchema>;

const countries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Uganda", "Tanzania", "Rwanda", "Zambia", "Botswana", "Ethiopia"
];

const statesByCountry: Record<string, string[]> = {
  "Nigeria": [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ],
  "Ghana": ["Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Machakos", "Meru", "Thika", "Garissa"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"],
  "Uganda": ["Kampala", "Wakiso", "Mukono", "Jinja", "Gulu", "Lira", "Mbarara", "Kasese", "Masaka", "Hoima"],
  "Tanzania": ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Kahama", "Tabora", "Zanzibar"],
  "Rwanda": ["Kigali", "Eastern", "Northern", "Southern", "Western"],
  "Zambia": ["Lusaka", "Copperbelt", "Southern", "Eastern", "Western", "Northern", "North-Western", "Central", "Luapula", "Muchinga"],
  "Botswana": ["Gaborone", "Francistown", "Molepolole", "Maun", "Lobatse", "Selibe Phikwe", "Kanye", "Serowe", "Mahalapye", "Palapye"],
  "Ethiopia": ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Awasa", "Bahir Dar", "Dessie", "Jimma", "Jijiga", "Shashamane"]
};

const AffiliateSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      country: "Nigeria"
    }
  });

  const selectedCountry = watch("country");
  const availableStates = selectedCountry ? statesByCountry[selectedCountry] || [] : [];

  const onSubmit = async (data: AffiliateFormData) => {
    setIsSubmitting(true);
    
    try {
      // Check if username is already taken
      const { data: existingAffiliate } = await supabase
        .from('affiliate_profiles')
        .select('username')
        .eq('username', data.username)
        .maybeSingle();

      if (existingAffiliate) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/affiliate-dashboard`
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Create affiliate profile
      const { error: profileError } = await supabase
        .from('affiliate_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          email: data.email,
          country: data.country,
          state_location: data.stateLocation,
          username: data.username,
          bank_account_name: data.bankAccountName,
          bank_account_number: data.bankAccountNumber,
          bank_name: data.bankName,
        });

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Registration Successful!",
        description: "Your affiliate account has been created. Please check your email to verify your account.",
      });

      navigate("/affiliate-dashboard");
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              Join Our Affiliate Program
            </CardTitle>
            <CardDescription className="text-lg">
              Earn Commissions by referring schools to SmartSchool Portal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select onValueChange={(value) => {
                  setValue("country", value);
                  setValue("stateLocation", ""); // Reset state when country changes
                }}>
                  <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stateLocation">State/Location *</Label>
                  <Select 
                    onValueChange={(value) => setValue("stateLocation", value)}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className={errors.stateLocation ? "border-destructive" : ""}>
                      <SelectValue placeholder={selectedCountry ? "Select State" : "Select Country First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stateLocation && (
                    <p className="text-sm text-destructive">{errors.stateLocation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username (Referral Code) *</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    className={errors.username ? "border-destructive" : ""}
                    placeholder="This will be your referral code"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName">Account Name *</Label>
                  <Input
                    id="bankAccountName"
                    {...register("bankAccountName")}
                    className={errors.bankAccountName ? "border-destructive" : ""}
                  />
                  {errors.bankAccountName && (
                    <p className="text-sm text-destructive">{errors.bankAccountName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      {...register("bankAccountNumber")}
                      className={errors.bankAccountNumber ? "border-destructive" : ""}
                    />
                    {errors.bankAccountNumber && (
                      <p className="text-sm text-destructive">{errors.bankAccountNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      {...register("bankName")}
                      className={errors.bankName ? "border-destructive" : ""}
                      placeholder="Enter your bank name"
                    />
                    {errors.bankName && (
                      <p className="text-sm text-destructive">{errors.bankName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Affiliate Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateSignup;