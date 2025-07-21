
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
    }
    logStep("MercadoPago access token configured", { 
      tokenLength: accessToken.length,
      tokenPrefix: accessToken.substring(0, 10) + "..." 
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    logStep("Creating payment preference with email", { email });

    // Criar preferência de pagamento no MercadoPago
    const preference = {
      items: [
        {
          title: "DinDin Mágico - Acesso Vitalício",
          description: "Aplicativo completo de controle financeiro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 0.01
        }
      ],
      payer: {
        email: email
      },
      back_urls: {
        success: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || 'https://b74122dd-46e5-4810-be06-69f354a9f317.lovableproject.com'}/download?email=${encodeURIComponent(email)}&payment=success`,
        failure: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || 'https://b74122dd-46e5-4810-be06-69f354a9f317.lovableproject.com'}/download?email=${encodeURIComponent(email)}&payment=failure`,
        pending: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || 'https://b74122dd-46e5-4810-be06-69f354a9f317.lovableproject.com'}/download?email=${encodeURIComponent(email)}&payment=pending`
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 1
      },
      external_reference: `dindin_${Date.now()}`,
      statement_descriptor: "DINDIN MAGICO",
      metadata: {
        email: email,
        product: "dindin_magico_app"
      },
      notification_url: `https://lvduexskoxjzjdirdcnt.supabase.co/functions/v1/mercadopago-webhook`
    };

    logStep("Creating MercadoPago preference", { preference });

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      logStep("MercadoPago API error", { 
        status: response.status, 
        statusText: response.statusText,
        error: responseText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`MercadoPago API error: ${response.status} - ${responseText}`);
    }

    let preferenceData;
    try {
      preferenceData = JSON.parse(responseText);
      logStep("MercadoPago preference created", { preferenceId: preferenceData.id });
    } catch (parseError) {
      logStep("Error parsing MercadoPago response", { responseText, parseError });
      throw new Error(`Invalid JSON response from MercadoPago: ${responseText}`);
    }

    try {
      await supabaseClient.from("orders").insert({
        mercadopago_preference_id: preferenceData.id,
        amount: 0.01,
        currency: "BRL",
        status: "pending",
        product_name: "DinDin Mágico - Acesso Vitalício",
        email: email
      });
      logStep("Order registered in database");
    } catch (dbError) {
      logStep("Database error (continuing anyway)", { error: dbError.message });
    }

    return new Response(JSON.stringify({ 
      init_point: preferenceData.init_point,
      preference_id: preferenceData.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
