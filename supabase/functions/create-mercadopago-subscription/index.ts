import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  user_id: string;
  plan_type: 'monthly' | 'yearly';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { plan_type }: SubscriptionRequest = await req.json();

    // Determine amount based on plan
    const amount = plan_type === 'yearly' ? 99.00 : 9.90;

    // Create preference for Mercado Pago
    const preference = {
      items: [
        {
          title: `Dindin Mágico Premium - ${plan_type === 'yearly' ? 'Anual' : 'Mensal'}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        }
      ],
      back_urls: {
        success: 'https://dindinmagico.netlify.app/dashboard?payment=success',
        failure: 'https://dindinmagico.netlify.app/dashboard?payment=failure',
        pending: 'https://dindinmagico.netlify.app/dashboard?payment=pending',
      },
      notification_url: `https://lvduexskoxjzjdirdcnt.supabase.co/functions/v1/mercadopago-webhook`,
      external_reference: user.id,
      auto_return: 'approved',
    };

    console.log('Creating Mercado Pago preference for user:', user.id);

    // Call Mercado Pago API
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mercado Pago error:', errorText);
      throw new Error(`Mercado Pago error: ${response.status}`);
    }

    const mercadoPagoResponse = await response.json();

    // Save subscription in database
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type,
        amount,
        currency: 'BRL',
        status: 'pending',
        mercadopago_payment_id: mercadoPagoResponse.id,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Subscription created successfully:', mercadoPagoResponse.id);

    return new Response(
      JSON.stringify({
        payment_url: mercadoPagoResponse.init_point,
        preference_id: mercadoPagoResponse.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});