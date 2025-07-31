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

    const body = await req.json();
    console.log('[WEBHOOK] Webhook received:', JSON.stringify(body, null, 2));
    console.log('[WEBHOOK] Headers received:', JSON.stringify(Object.fromEntries(req.headers), null, 2));

    // Only process payment notifications
    if (body.type !== 'payment') {
      console.log('[WEBHOOK] Ignoring non-payment notification');
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get payment details from Mercado Pago
    const paymentId = body.data.id;
    console.log('[WEBHOOK] Processing payment ID:', paymentId);

        success: `https://dindinmagico.netlify.app/create-account?email=${encodeURIComponent(email)}&payment=success`,
        failure: `https://dindinmagico.netlify.app/create-account?email=${encodeURIComponent(email)}&payment=failure`,
        pending: `https://dindinmagico.netlify.app/create-account?email=${encodeURIComponent(email)}&payment=pending`
      },
    });

    if (!paymentResponse.ok) {
      throw new Error(`Failed to get payment details: ${paymentResponse.status}`);
    }

    const payment = await paymentResponse.json();
    console.log('[WEBHOOK] Payment details:', JSON.stringify(payment, null, 2));

    const status = payment.status; // approved, rejected, pending, etc.
    const payerEmail = payment.payer?.email;
    const preferenceId = payment.preference_id;
    const externalRef = payment.external_reference;

    console.log(`[WEBHOOK] Processing payment status: ${status}, email: ${payerEmail}, preference: ${preferenceId}, external_ref: ${externalRef}`);

    // Try to find the order using external_reference first (which contains our preference ID)
    let existingOrder = null;
    let findError = null;
    
    if (externalRef && externalRef.startsWith('dindin_')) {
      // Extract preference ID from external reference by looking for matching orders
      const { data: ordersByRef, error: refError } = await supabaseClient
        .from('orders')
        .select('*')
        .contains('mercadopago_preference_id', externalRef.split('_')[1]);
        
      if (!refError && ordersByRef && ordersByRef.length > 0) {
        existingOrder = ordersByRef[0];
      }
    }
    
    // If not found by external ref, try by preference_id
    if (!existingOrder && preferenceId) {
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('mercadopago_preference_id', preferenceId)
        .single();
        
      existingOrder = orderData;
      findError = orderError;
    }
    
    // If still not found, try to match by timestamp (last resort)
    if (!existingOrder) {
      const { data: recentOrders, error: recentError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!recentError && recentOrders && recentOrders.length > 0) {
        // Use the most recent pending order
        existingOrder = recentOrders[0];
        console.log('[WEBHOOK] Using most recent pending order as fallback:', existingOrder.id);
      }
    }

    if (findError && findError.code !== 'PGRST116') {
      console.error('[WEBHOOK] Error finding order:', findError);
      throw findError;
    }

    if (!existingOrder) {
      console.log('[WEBHOOK] No matching order found for preference:', preferenceId);
      return new Response(JSON.stringify({ status: 'order_not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[WEBHOOK] Found order:', existingOrder.id, 'Email:', existingOrder.email);

    // Update order status and email in database
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    // Update email if available from payment and not already set
    if (payerEmail && (!existingOrder.email || existingOrder.email !== payerEmail)) {
      updateData.email = payerEmail;
      console.log('[WEBHOOK] Updating order email from', existingOrder.email, 'to', payerEmail);
    }

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', existingOrder.id);

    if (updateError) {
      console.error('[WEBHOOK] Error updating order:', updateError);
      throw updateError;
    }

    console.log('[WEBHOOK] Order status updated to:', status);

    if (status === 'approved') {
      console.log('[WEBHOOK] Payment approved! Processing completion...');
      
      // Enviar email de download automaticamente
      if (payerEmail || existingOrder.email) {
        const emailToSend = payerEmail || existingOrder.email;
        
      // Fazer chamada para envio de email em background, sem bloquear o webhook
      try {
        console.log('[WEBHOOK] Attempting to send download email to:', emailToSend);
        
        // Verificar se o email não está mascarado
        if (emailToSend === "XXXXXXXXXXX" || emailToSend.includes("XXX")) {
          console.log('[WEBHOOK] Email is masked by MercadoPago, skipping email send');
        } else {
          // Usar fetch diretamente para não depender do supabase client
          const emailResponse = await fetch(`https://lvduexskoxjzjdirdcnt.supabase.co/functions/v1/send-download-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ email: emailToSend })
          });
          
          if (emailResponse.ok) {
            console.log('[WEBHOOK] Download email sent successfully');
          } else {
            const errorText = await emailResponse.text();
            console.error('[WEBHOOK] Error sending download email:', errorText);
          }
        }
      } catch (emailErr) {
        console.error('[WEBHOOK] Exception sending download email:', emailErr);
      }
      }
      
      console.log('[WEBHOOK] Order completed successfully');
    } else {
      console.log(`[WEBHOOK] Payment status is ${status}, order updated but not completed`);
    }

    return new Response(JSON.stringify({ status: 'processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});