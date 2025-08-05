import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference }: VerificationRequest = await req.json();

    // Get Paystack config from admin_configs table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: configs } = await supabase
      .from("admin_configs")
      .select("config_key, config_value")
      .in("config_key", ["paystack_secret_key"]);

    if (!configs || configs.length === 0) {
      throw new Error("Paystack configuration not found");
    }

    const paystackSecretKey = configs.find(c => c.config_key === "paystack_secret_key")?.config_value;

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(paystackData.message || "Failed to verify payment");
    }

    // Update payment status in database if successful
    if (paystackData.status && paystackData.data.status === "success") {
      const signupId = paystackData.data.metadata?.signup_id;
      
      if (signupId) {
        await supabase
          .from("school_signups")
          .update({ payment_status: "paid" })
          .eq("id", signupId);
      }
    }

    return new Response(JSON.stringify(paystackData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);