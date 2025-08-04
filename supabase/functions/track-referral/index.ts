import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackReferralRequest {
  referralCode: string;
  visitorIp?: string;
  userAgent?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referralCode, visitorIp, userAgent }: TrackReferralRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Tracking referral for code:", referralCode);

    // Find affiliate by code
    const { data: affiliate } = await supabaseClient
      .from("affiliates")
      .select("id, status")
      .eq("affiliate_code", referralCode)
      .eq("status", "approved")
      .single();

    if (!affiliate) {
      console.log("Affiliate not found or not approved:", referralCode);
      return new Response(
        JSON.stringify({ error: "Invalid or inactive referral code" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if referral already exists for this IP in the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: existingReferral } = await supabaseClient
      .from("referrals")
      .select("id")
      .eq("affiliate_id", affiliate.id)
      .eq("visitor_ip", visitorIp)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .maybeSingle();

    if (existingReferral) {
      console.log("Referral already tracked for this IP");
      return new Response(
        JSON.stringify({ message: "Referral already tracked" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create new referral tracking
    const { error } = await supabaseClient
      .from("referrals")
      .insert({
        affiliate_id: affiliate.id,
        referral_code: referralCode,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        status: "pending",
      });

    if (error) {
      console.error("Error creating referral:", error);
      throw error;
    }

    console.log("Referral tracked successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in track-referral function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});