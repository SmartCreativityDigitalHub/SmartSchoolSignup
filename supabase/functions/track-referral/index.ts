import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackReferralRequest {
  referralCode: string;
  visitorIp: string;
  userAgent: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referralCode, visitorIp, userAgent }: TrackReferralRequest = await req.json();

    console.log('Tracking referral:', { referralCode, visitorIp });

    // Find the affiliate by username (referral code)
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('username', referralCode)
      .eq('is_active', true)
      .single();

    if (affiliateError || !affiliate) {
      console.log('Affiliate not found:', referralCode);
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Track the referral visit
    const { error: trackingError } = await supabase
      .from('referral_tracking')
      .insert({
        affiliate_id: affiliate.id,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referral_code: referralCode,
      });

    if (trackingError) {
      console.error('Error tracking referral:', trackingError);
      return new Response(
        JSON.stringify({ error: 'Failed to track referral' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Referral tracked successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in track-referral function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);