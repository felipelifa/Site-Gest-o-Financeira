import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[KIWIFY-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    logStep("Webhook payload", { body });

    // Verificar se é um evento de pagamento aprovado
    if (body.event !== 'order.paid' && body.event !== 'order.approved') {
      logStep("Ignoring non-payment event", { event: body.event });
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const order = body.data;
    const customerEmail = order.customer?.email;
    const customerName = order.customer?.name;
    const orderId = order.id;
    const productId = order.product?.id;

    if (!customerEmail) {
      logStep("No customer email found");
      return new Response(JSON.stringify({ error: 'No customer email' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    logStep("Processing approved order", { 
      email: customerEmail, 
      name: customerName, 
      orderId, 
      productId 
    });

    // Salvar/atualizar cliente no banco
    const { error: customerError } = await supabaseClient
      .from('kiwify_customers')
      .upsert({
        email: customerEmail,
        kiwify_customer_id: order.customer?.id,
        name: customerName || customerEmail.split('@')[0],
        last_order_id: orderId,
        last_purchase_date: order.created_at,
        status: 'active'
      }, {
        onConflict: 'email'
      });

    if (customerError) {
      logStep("Error saving customer", { error: customerError });
    }

    // Verificar se o usuário já existe
    const { data: existingUser, error: userError } = await supabaseClient.auth.admin.getUserByEmail(customerEmail);

    let userId = null;

    if (userError || !existingUser.user) {
      // Criar novo usuário
      logStep("Creating new user", { email: customerEmail });
      
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: customerEmail,
        password: `kiwify_${orderId}_${Date.now()}`, // Senha temporária única
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: customerName || customerEmail.split('@')[0],
          kiwify_customer_id: order.customer?.id,
          created_via: 'kiwify',
          kiwify_order_id: orderId
        }
      });

      if (createError) {
        logStep("Error creating user", { error: createError });
        throw createError;
      }

      userId = newUser.user?.id;
      logStep("User created successfully", { userId });
    } else {
      userId = existingUser.user.id;
      logStep("User already exists", { userId });
    }

    if (userId) {
      // Ativar premium no perfil
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: userId,
          email: customerEmail,
          full_name: customerName || customerEmail.split('@')[0],
          is_premium: true,
          subscription_status: 'active',
          kiwify_customer_id: order.customer?.id,
          kiwify_order_id: orderId
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        logStep("Error updating profile", { error: profileError });
      } else {
        logStep("Profile updated successfully");
      }

      // Criar registro de assinatura
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'lifetime', // Plano vitalício do Kiwify
          amount: order.amount || 97,
          currency: 'BRL',
          status: 'approved',
          kiwify_order_id: orderId,
          expires_at: null // Vitalício
        });

      if (subscriptionError) {
        logStep("Error creating subscription", { error: subscriptionError });
      } else {
        logStep("Subscription created successfully");
      }
    }

    // Enviar email de boas-vindas (opcional)
    try {
      await supabaseClient.functions.invoke('send-welcome-email', {
        body: { 
          email: customerEmail, 
          name: customerName,
          source: 'kiwify'
        }
      });
      logStep("Welcome email sent");
    } catch (emailError) {
      logStep("Error sending welcome email", { error: emailError });
    }

    return new Response(JSON.stringify({ 
      status: 'processed',
      userId,
      email: customerEmail
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in kiwify-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});