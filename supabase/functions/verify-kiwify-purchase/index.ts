import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-KIWIFY] ${step}${detailsStr}`);
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
    
    logStep("Verifying Kiwify purchase for email", { email });

    // Verificar se existe uma compra no Kiwify
    const kiwifyApiKey = Deno.env.get("KIWIFY_API_KEY");
    
    if (!kiwifyApiKey) {
      logStep("Kiwify API key not configured, checking local orders");
      
      // Fallback: verificar orders locais
      const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        logStep("Database error", { error });
        throw error;
      }

      const hasValidPurchase = orders && orders.length > 0;
      
      return new Response(JSON.stringify({ 
        hasValidPurchase,
        customerData: hasValidPurchase ? { 
          email, 
          name: email.split('@')[0],
          source: 'local_orders'
        } : null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar compra no Kiwify via API
    try {
      const kiwifyResponse = await fetch(`https://api.kiwify.com.br/v1/orders?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${kiwifyApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!kiwifyResponse.ok) {
        logStep("Kiwify API error", { status: kiwifyResponse.status });
        throw new Error(`Kiwify API error: ${kiwifyResponse.status}`);
      }

      const kiwifyData = await kiwifyResponse.json();
      logStep("Kiwify response", { data: kiwifyData });

      // Verificar se há compras aprovadas
      const approvedOrders = kiwifyData.data?.filter((order: any) => 
        order.status === 'paid' || order.status === 'approved'
      ) || [];

      const hasValidPurchase = approvedOrders.length > 0;
      
      let customerData = null;
      if (hasValidPurchase) {
        const latestOrder = approvedOrders[0];
        customerData = {
          id: latestOrder.customer?.id,
          email: latestOrder.customer?.email || email,
          name: latestOrder.customer?.name || email.split('@')[0],
          order_id: latestOrder.id,
          product_id: latestOrder.product?.id,
          source: 'kiwify'
        };

        // Salvar/atualizar informações do cliente no banco
        await supabaseClient
          .from('kiwify_customers')
          .upsert({
            email: customerData.email,
            kiwify_customer_id: customerData.id,
            name: customerData.name,
            last_order_id: customerData.order_id,
            last_purchase_date: latestOrder.created_at,
            status: 'active'
          }, {
            onConflict: 'email'
          });
      }

      logStep("Purchase verification result", { 
        email, 
        hasValidPurchase, 
        approvedOrdersCount: approvedOrders.length
      });

      return new Response(JSON.stringify({ 
        hasValidPurchase,
        customerData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (kiwifyError) {
      logStep("Error calling Kiwify API", { error: kiwifyError.message });
      
      // Fallback para orders locais em caso de erro na API do Kiwify
      const { data: orders, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const hasValidPurchase = orders && orders.length > 0;
      
      return new Response(JSON.stringify({ 
        hasValidPurchase,
        customerData: hasValidPurchase ? { 
          email, 
          name: email.split('@')[0],
          source: 'local_orders_fallback'
        } : null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-kiwify-purchase", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      hasValidPurchase: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});