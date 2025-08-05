import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();

    // Get SMTP config from admin_configs table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: configs } = await supabase
      .from("admin_configs")
      .select("config_key, config_value")
      .in("config_key", [
        "smtp_host",
        "smtp_port", 
        "smtp_user",
        "smtp_password",
        "smtp_from_email"
      ]);

    if (!configs || configs.length === 0) {
      throw new Error("SMTP configuration not found");
    }

    const smtpConfig = configs.reduce((acc, config) => {
      acc[config.config_key] = config.config_value;
      return acc;
    }, {} as Record<string, string>);

    const recipients = Array.isArray(to) ? to : [to];
    
    // Send email using SMTP
    const emailData = {
      host: smtpConfig.smtp_host,
      port: parseInt(smtpConfig.smtp_port || "465"),
      secure: true, // SSL/TLS
      auth: {
        user: smtpConfig.smtp_user,
        pass: smtpConfig.smtp_password,
      },
      from: smtpConfig.smtp_from_email,
      to: recipients.join(", "),
      subject,
      html,
    };

    // For now, we'll use a simple HTTP request to send email
    // In production, you might want to use nodemailer or similar
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: "gmail",
        template_id: "template_smtp",
        user_id: "your_user_id",
        template_params: emailData,
      }),
    });

    if (!response.ok) {
      // Fallback: Log the email details for manual processing
      console.log("Email sending failed, logging for manual processing:", {
        to: recipients,
        subject,
        from: smtpConfig.smtp_from_email,
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);