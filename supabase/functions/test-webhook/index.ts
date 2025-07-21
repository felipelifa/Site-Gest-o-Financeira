import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, testPaymentId = "test_123456" } = await req.json();
    
    console.log(`[TEST-WEBHOOK] Testing webhook simulation for email: ${email}`);

    // Simular webhook do MercadoPago
    const webhookPayload = {
      type: "payment",
      data: {
        id: testPaymentId
      }
    };

    console.log(`[TEST-WEBHOOK] Calling webhook with payload:`, webhookPayload);

    // Chamar o webhook real
    const webhookResponse = await fetch('https://lvduexskoxjzjdirdcnt.supabase.co/functions/v1/mercadopago-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    const webhookResult = await webhookResponse.text();
    console.log(`[TEST-WEBHOOK] Webhook response:`, webhookResult);

    return new Response(JSON.stringify({ 
      success: true,
      webhookStatus: webhookResponse.status,
      webhookResponse: webhookResult,
      message: "Teste de webhook executado"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[TEST-WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});