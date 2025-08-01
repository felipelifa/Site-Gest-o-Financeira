import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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
    
    logStep("Verifying payment for email", { email });

    // Buscar pedidos aprovados para este email
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      logStep("Database error", { error });
      throw error;
    }

    logStep("Orders found by email", { ordersCount: orders?.length || 0, orders });

    // Se não encontrou por email exato, buscar por emails mascarados recentes
    let additionalOrders = [];
    if (!orders || orders.length === 0) {
      logStep("No orders found by email, checking recent approved orders");
      
      const { data: recentApproved, error: recentError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('status', 'approved')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // últimas 24h
        .order('created_at', { ascending: false });
        
      if (!recentError && recentApproved) {
        logStep("Found recent approved orders", { count: recentApproved.length });
        additionalOrders = recentApproved;
      }
    }

    const allOrders = [...(orders || []), ...additionalOrders];
    logStep("All orders considered", { totalCount: allOrders.length });

    // Verificar se há pelo menos um pedido aprovado
    const approvedOrders = allOrders.filter(order => order.status === 'approved');
    const hasValidPayment = approvedOrders.length > 0;
    
    logStep("Payment verification result", { 
      email, 
      hasValidPayment, 
      totalOrders: orders?.length || 0,
      approvedOrders: approvedOrders.length,
      orderStatuses: orders?.map(o => ({ id: o.id, status: o.status, email: o.email })) || []
    });

    let access_token = null;
    let refresh_token = null;

    if (hasValidPayment) {
      // Obter o usuário pelo email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);

      if (!userData || userError) {
        throw new Error("Usuário não encontrado no Supabase Auth.");
      }

      // Gerar link mágico com tokens (sem envio de e-mail)
     const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createUserSession({
  user_id: userData.user.id,
});

if (sessionError || !sessionData) {
  throw new Error("Erro ao criar sessão do usuário.");
}

access_token = sessionData.session.access_token;
refresh_token = sessionData.session.refresh_token;


      logStep("Tokens gerados com sucesso");
    }

    return new Response(JSON.stringify({ 
      hasValidPayment,
      email,
      access_token,
      refresh_token,
      orders: orders || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      hasValidPayment: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
