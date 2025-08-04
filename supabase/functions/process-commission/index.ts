import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessCommissionRequest {
  schoolSignupId: string;
  referralCode?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolSignupId, referralCode }: ProcessCommissionRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing commission for signup:", schoolSignupId, "referral:", referralCode);

    // Get school signup details
    const { data: schoolSignup } = await supabaseClient
      .from("school_signups")
      .select("*")
      .eq("id", schoolSignupId)
      .single();

    if (!schoolSignup) {
      console.log("School signup not found");
      return new Response(
        JSON.stringify({ error: "School signup not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Only process if payment is confirmed
    if (schoolSignup.payment_status !== "paid") {
      console.log("Payment not confirmed yet");
      return new Response(
        JSON.stringify({ message: "Payment not confirmed yet" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let affiliateId = null;

    // Check if referral code was provided
    if (referralCode) {
      const { data: affiliate } = await supabaseClient
        .from("affiliates")
        .select("id, commission_rate, status")
        .eq("affiliate_code", referralCode)
        .eq("status", "approved")
        .single();

      if (affiliate) {
        affiliateId = affiliate.id;

        // Find pending referral
        const { data: referral } = await supabaseClient
          .from("referrals")
          .select("*")
          .eq("affiliate_id", affiliate.id)
          .eq("referral_code", referralCode)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (referral) {
          // Calculate commission
          const commissionAmount = (schoolSignup.total_amount * affiliate.commission_rate) / 100;

          // Update referral
          await supabaseClient
            .from("referrals")
            .update({
              school_signup_id: schoolSignupId,
              status: "converted",
              commission_amount: commissionAmount,
            })
            .eq("id", referral.id);

          // Update affiliate earnings
          await supabaseClient
            .from("affiliates")
            .update({
              total_earnings: affiliate.total_earnings + commissionAmount,
              pending_amount: affiliate.pending_amount + commissionAmount,
            })
            .eq("id", affiliate.id);

          console.log("Commission processed:", commissionAmount);

          return new Response(
            JSON.stringify({ 
              success: true, 
              commission: commissionAmount,
              affiliate: referralCode
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }
    }

    // Check for cookie-based referral (if no direct referral code)
    if (!affiliateId) {
      // Look for recent referral within 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: recentReferral } = await supabaseClient
        .from("referrals")
        .select("*, affiliates(id, commission_rate, total_earnings, pending_amount)")
        .eq("status", "pending")
        .gte("created_at", ninetyDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentReferral && recentReferral.affiliates) {
        const affiliate = recentReferral.affiliates;
        const commissionAmount = (schoolSignup.total_amount * affiliate.commission_rate) / 100;

        // Update referral
        await supabaseClient
          .from("referrals")
          .update({
            school_signup_id: schoolSignupId,
            status: "converted",
            commission_amount: commissionAmount,
          })
          .eq("id", recentReferral.id);

        // Update affiliate earnings
        await supabaseClient
          .from("affiliates")
          .update({
            total_earnings: affiliate.total_earnings + commissionAmount,
            pending_amount: affiliate.pending_amount + commissionAmount,
          })
          .eq("id", affiliate.id);

        console.log("Cookie-based commission processed:", commissionAmount);

        return new Response(
          JSON.stringify({ 
            success: true, 
            commission: commissionAmount,
            affiliate: recentReferral.referral_code
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    console.log("No valid referral found for commission");

    return new Response(
      JSON.stringify({ message: "No valid referral found" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in process-commission function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});