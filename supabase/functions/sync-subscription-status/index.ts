import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting subscription status sync...');

    // Get all pending subscriptions with mercadopago_payment_id
    const { data: pendingSubscriptions, error: fetchError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('status', 'pending')
      .not('mercadopago_payment_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching pending subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingSubscriptions?.length || 0} pending subscriptions`);

    const results = [];

    for (const subscription of pendingSubscriptions || []) {
      console.log(`Checking subscription ${subscription.id} with preference ${subscription.mercadopago_payment_id}`);

      try {
        // Get preference details first
        const preferenceResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${subscription.mercadopago_payment_id}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
          },
        });

        if (preferenceResponse.ok) {
          const preference = await preferenceResponse.json();
          console.log(`Preference found for ${subscription.mercadopago_payment_id}`);
          
          // Get the user's recent payments
          const paymentsResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${subscription.user_id}&limit=100`, {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
            },
          });

          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            const payments = paymentsData.results || [];

            console.log(`Found ${payments.length} payments for user ${subscription.user_id}`);

            // Find approved payment that matches our preference
            const approvedPayment = payments.find((payment: any) => 
              payment.status === 'approved' && 
              payment.external_reference === subscription.user_id &&
              payment.preference_id === subscription.mercadopago_payment_id
            );

            if (approvedPayment) {
              console.log(`Found approved payment ${approvedPayment.id} for subscription ${subscription.id}`);

              // Update subscription status
              const { error: updateError } = await supabaseClient
                .from('subscriptions')
                .update({
                  status: 'approved',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', subscription.id);

              if (updateError) {
                console.error('Error updating subscription:', updateError);
                results.push({
                  subscription_id: subscription.id,
                  user_id: subscription.user_id,
                  status: 'update_error',
                  error: updateError.message
                });
                continue;
              }

              // Calculate expiry date
              const expiresAt = new Date();
              if (subscription.plan_type === 'yearly') {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
              } else {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
              }

              // Update user profile
              const { error: profileError } = await supabaseClient
                .from('profiles')
                .update({
                  is_premium: true,
                  subscription_status: 'active',
                })
                .eq('id', subscription.user_id);

              if (profileError) {
                console.error('Error updating profile:', profileError);
                results.push({
                  subscription_id: subscription.id,
                  user_id: subscription.user_id,
                  status: 'profile_error',
                  error: profileError.message
                });
                continue;
              }

              // Update subscription with expiry date
              const { error: expiryError } = await supabaseClient
                .from('subscriptions')
                .update({
                  expires_at: expiresAt.toISOString(),
                })
                .eq('id', subscription.id);

              if (expiryError) {
                console.error('Error updating subscription expiry:', expiryError);
              }

              results.push({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                status: 'activated',
                payment_id: approvedPayment.id,
                expires_at: expiresAt.toISOString()
              });

              console.log(`Successfully activated subscription ${subscription.id} for user ${subscription.user_id}`);
            } else {
              console.log(`No approved payment found for subscription ${subscription.id}`);
              results.push({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                status: 'no_approved_payment',
                payments_found: payments.length,
                payment_statuses: payments.map((p: any) => p.status)
              });
            }
          } else {
            console.error(`Failed to get payments for user ${subscription.user_id}: ${paymentsResponse.status}`);
            results.push({
              subscription_id: subscription.id,
              user_id: subscription.user_id,
              status: 'payment_search_error',
              error: `API error: ${paymentsResponse.status}`
            });
          }
        } else {
          console.error(`Failed to get preference ${subscription.mercadopago_payment_id}: ${preferenceResponse.status}`);
          results.push({
            subscription_id: subscription.id,
            user_id: subscription.user_id,
            status: 'preference_error',
            error: `API error: ${preferenceResponse.status}`
          });
        }
      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        results.push({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('Sync completed, results:', results);

    return new Response(JSON.stringify({
      processed: results.length,
      results: results,
      success: results.filter(r => r.status === 'activated').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});