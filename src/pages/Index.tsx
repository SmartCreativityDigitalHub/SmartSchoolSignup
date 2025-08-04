import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingCalculator from "@/components/PricingCalculator";
import FeatureComparison from "@/components/FeatureComparison";
import { supabase } from "@/integrations/supabase/client";

interface PricingData {
  students: number;
  plan: "starter" | "standard";
  discount: number;
  total: number;
}

const Index = () => {
  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      // Store referral code in localStorage
      localStorage.setItem('referral_code', referralCode);
      
      // Track the referral
      const trackReferral = async () => {
        try {
          const visitorIp = await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
            .catch(() => 'unknown');

          await supabase.functions.invoke('track-referral', {
            body: {
              referralCode,
              visitorIp,
              userAgent: navigator.userAgent,
            },
          });
        } catch (error) {
          console.error('Error tracking referral:', error);
        }
      };

      trackReferral();
    }
  }, []);
  const navigate = useNavigate();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const handleSignUp = (data: PricingData) => {
    setPricingData(data);
    // Navigate to signup page with the pricing data
    navigate("/signup", { state: { pricingData: data } });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Navigation Tabs */}
        <Tabs defaultValue="pricing" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-fit grid-cols-2 h-12 p-1 bg-muted rounded-xl shadow-elegant">
              <TabsTrigger 
                value="pricing" 
                className="px-8 py-2 text-lg font-medium transition-smooth data-[state=active]:shadow-elegant data-[state=active]:gradient-bg data-[state=active]:text-white"
              >
                Termly View
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="px-8 py-2 text-lg font-medium transition-smooth data-[state=active]:shadow-elegant data-[state=active]:gradient-bg data-[state=active]:text-white"
              >
                Compare View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pricing" className="space-y-8">
            <PricingCalculator onSignUp={handleSignUp} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <FeatureComparison />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            © 2024 SmartSchool. All rights reserved. | 
            <span className="text-primary ml-2">For support: +234 906 869 1062</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
