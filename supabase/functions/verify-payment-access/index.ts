import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    logStep("Verifying payment access for email", { email });

    // Buscar pedidos aprovados para este email nas últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentOrders, error: recentError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .gte('updated_at', twentyFourHoursAgo)
      .order('updated_at', { ascending: false });

    if (recentError) {
      logStep("Database error checking recent orders", { error: recentError });
      throw recentError;
    }

    // Se não encontrou pedidos recentes, verificar pedidos aprovados mais antigos
    let allApprovedOrders = recentOrders || [];
    
    if (!recentOrders || recentOrders.length === 0) {
      logStep("No recent orders found, checking all approved orders");
      
      const { data: allOrders, error: allError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false });

      if (!allError && allOrders) {
        allApprovedOrders = allOrders;
      }
    }

    logStep("Orders found", { 
      recentCount: recentOrders?.length || 0,
      totalApprovedCount: allApprovedOrders.length,
      orders: allApprovedOrders.map(o => ({ 
        id: o.id, 
        status: o.status, 
        updated_at: o.updated_at,
        amount: o.amount 
      }))
    });

    const hasValidPayment = allApprovedOrders.length > 0;
    
    if (!hasValidPayment) {
      logStep("No valid payment found", { email });
      return new Response(JSON.stringify({ 
        hasValidPayment: false,
        message: "Nenhum pagamento aprovado encontrado para este email"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar se o usuário já existe no Supabase Auth
    const { data: existingUser, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);

    let userId = null;

    if (userError || !existingUser.user) {
      // Criar novo usuário automaticamente
      logStep("Creating new user for approved payment", { email });
      
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: `dindin_${Date.now()}_${Math.random().toString(36).substring(2)}`, // Senha temporária única
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: email.split('@')[0],
          created_via: 'payment_verification',
          payment_verified: true
        }
      });

      if (createError) {
        logStep("Error creating user", { error: createError });
        throw createError;
      }

      userId = newUser.user?.id;
      logStep("User created successfully", { userId });

      // Criar perfil do usuário
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: email.split('@')[0],
          is_premium: true,
          subscription_status: 'active',
          onboarding_completed: false
        });

      if (profileError) {
        logStep("Error creating profile", { error: profileError });
      }
    } else {
      userId = existingUser.user.id;
      logStep("User already exists", { userId });

      // Atualizar status premium se necessário
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          is_premium: true,
          subscription_status: 'active'
        })
        .eq('id', userId);

      if (updateError) {
        logStep("Error updating profile", { error: updateError });
      }
    }

    // Gerar tokens de sessão
    logStep("Generating session tokens", { userId });
    
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createUserSession({
      user_id: userId,
    });

    if (sessionError || !sessionData) {
      logStep("Error creating session", { error: sessionError });
      throw new Error("Erro ao criar sessão do usuário");
    }

    logStep("Session created successfully", { 
      userId,
      hasAccessToken: !!sessionData.session.access_token,
      hasRefreshToken: !!sessionData.session.refresh_token
    });

    return new Response(JSON.stringify({ 
      hasValidPayment: true,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user_id: userId,
      email: email,
      message: "Acesso verificado e liberado com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment-access", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      hasValidPayment: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});