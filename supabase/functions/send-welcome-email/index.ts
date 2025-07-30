import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_PASSWORD");
    
    if (!gmailUser || !gmailPassword) {
      throw new Error("GMAIL_USER and GMAIL_PASSWORD must be configured");
    }

    const { email, name, source = 'kiwify' } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    logStep("Sending welcome email", { email, name, source });

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    const dashboardUrl = `https://dindinmagico.netlify.app/dashboard`;
    const firstName = name ? name.split(' ')[0] : email.split('@')[0];
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao DinDin Mágico!</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 3em;
              margin-bottom: 10px;
            }
            .title {
              color: #8B5CF6;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .welcome-section {
              background: linear-gradient(135deg, #8B5CF6, #06D6A0);
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
              color: white;
            }
            .access-button {
              display: inline-block;
              background: linear-gradient(135deg, #06D6A0, #059669);
              color: white;
              padding: 18px 35px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 15px 0;
              font-size: 18px;
              text-align: center;
            }
            .features {
              margin: 25px 0;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 15px 0;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #8B5CF6;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .tips {
              background: #fef3c7;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💰✨</div>
              <h1 class="title">Bem-vindo ao DinDin Mágico!</h1>
              <p>Olá <strong>${firstName}</strong>, sua jornada de transformação financeira começa agora! 🎉</p>
            </div>

            <div class="welcome-section">
              <h2 style="margin: 0 0 15px 0; font-size: 24px;">🎯 Sua conta está ativa!</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px;">
                Parabéns! Você agora tem acesso completo ao DinDin Mágico.
              </p>
              <a href="${dashboardUrl}" class="access-button">
                🚀 Acessar Minha Conta Agora
              </a>
            </div>

            <div class="features">
              <h3 style="color: #8B5CF6; margin-bottom: 20px;">🎁 O que você pode fazer agora:</h3>
              
              <div class="feature">
                <div class="feature-icon">🎯</div>
                <div>
                  <strong>Controle Total de Gastos</strong><br>
                  Anote seus gastos em segundos e veja onde seu dinheiro está indo
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">🎤</div>
                <div>
                  <strong>Comando de Voz Mágico</strong><br>
                  Fale "Gastei 50 reais no almoço" e pronto! Tudo anotado automaticamente
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">📊</div>
                <div>
                  <strong>Relatórios Visuais</strong><br>
                  Gráficos coloridos que mostram exatamente onde você pode economizar
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">🏆</div>
                <div>
                  <strong>Sistema de Metas</strong><br>
                  Defina objetivos e acompanhe seu progresso em tempo real
                </div>
              </div>
            </div>

            <div class="tips">
              <h3 style="color: #f59e0b; margin-top: 0;">💡 Dicas para começar:</h3>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Primeiro passo:</strong> Acesse sua conta e configure seu perfil</li>
                <li><strong>Anote seus gastos:</strong> Comece registrando os gastos de hoje</li>
                <li><strong>Defina uma meta:</strong> Escolha algo que quer conquistar</li>
                <li><strong>Use o comando de voz:</strong> É mais rápido e prático!</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="access-button">
                ✨ Começar Minha Transformação Agora
              </a>
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">🛡️ Garantia de Satisfação</h4>
              <p style="margin-bottom: 0;">
                Lembre-se: você tem <strong>30 dias</strong> para testar tudo. Se não ficar satisfeito, 
                devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia!
              </p>
            </div>

            <div class="footer">
              <p>Precisa de ajuda? Responda este email ou entre em contato:</p>
              <p><strong>suporte@dindinmagico.com</strong></p>
              <p>Responderemos em até 24 horas</p>
              <hr style="margin: 20px 0;">
              <p>DinDin Mágico - Transformando vidas financeiras desde 2024</p>
              <p>Você recebeu este email porque adquiriu o DinDin Mágico via ${source === 'kiwify' ? 'Kiwify' : 'nossa plataforma'}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    logStep("Sending welcome email");

    try {
      await client.send({
        from: gmailUser,
        to: email,
        subject: `🎉 ${firstName}, bem-vindo ao DinDin Mágico! Sua conta está ativa`,
        html: emailHtml,
      });
      
      logStep("Welcome email sent successfully");
      
    } catch (emailError) {
      logStep("Error sending email", { error: emailError.message });
      throw emailError;
    } finally {
      try {
        await client.close();
      } catch (closeError) {
        logStep("Error closing SMTP connection", { error: closeError.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de boas-vindas enviado com sucesso" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-welcome-email", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});