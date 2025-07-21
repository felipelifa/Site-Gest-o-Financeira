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
    const { email } = await req.json();
    
    console.log(`[TEST-EMAIL-DIRECT] Testing direct email sending for: ${email}`);

    // Chamar a função de email diretamente
    const emailResponse = await fetch('https://lvduexskoxjzjdirdcnt.supabase.co/functions/v1/send-download-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ email })
    });

    const emailResult = await emailResponse.text();
    console.log(`[TEST-EMAIL-DIRECT] Email response:`, emailResult);

    return new Response(JSON.stringify({ 
      success: true,
      emailStatus: emailResponse.status,
      emailResponse: emailResult,
      message: "Teste direto de email executado"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[TEST-EMAIL-DIRECT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});