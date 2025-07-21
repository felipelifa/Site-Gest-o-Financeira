import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-DOWNLOAD-EMAIL] ${step}${detailsStr}`);
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
    logStep("Gmail credentials verified");

    const body = await req.text();
    logStep("Raw body received", { body });
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      logStep("JSON parse error", { error: parseError.message, body });
      throw new Error("Invalid JSON in request body");
    }
    
    const { email } = parsedBody;
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    // Validar formato do email (aceitar emails mascarados do MercadoPago)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isMaskedEmail = email === "XXXXXXXXXXX" || email.includes("XXX");
    
    if (!isMaskedEmail && !emailRegex.test(email)) {
      logStep("Invalid email format", { email });
      throw new Error("No valid emails provided!");
    }
    
    if (isMaskedEmail) {
      logStep("Email is masked by MercadoPago, cannot send email", { email });
      throw new Error("Email is masked by payment processor, cannot send notification");
    }
    
    logStep("Email provided", { email });

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

    const downloadPageUrl = `https://dindinmagico.netlify.app/download?email=${encodeURIComponent(email)}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DinDin Mágico - Download do App</title>
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
              font-size: 2em;
              margin-bottom: 10px;
            }
            .title {
              color: #2563eb;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .download-section {
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .download-button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 10px 5px;
              text-align: center;
            }
            .android { background: linear-gradient(135deg, #22c55e, #16a34a); }
            .ios { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .instructions {
              margin: 20px 0;
              padding: 15px;
              background: #fef3c7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💰✨</div>
              <h1 class="title">Seu DinDin Mágico está pronto!</h1>
              <p>Obrigado pela compra! Faça o download do app e comece a organizar suas finanças.</p>
            </div>

            <div class="download-section">
              <h2>📱 Downloads Disponíveis</h2>
              <div style="text-align: center;">
                <a href="https://drive.google.com/drive/folders/1bLQhwXtOJDcNzBWZy8kHFGJqL5rN2mX9" class="download-button android">
                  📱 Download Android (APK)
                </a>
                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                  <strong>iOS:</strong> Em breve na App Store
                </p>
              </div>
            </div>

            <div class="instructions">
              <h3>📋 Instruções Rápidas:</h3>
              <p><strong>Android:</strong> Baixe o APK, habilite "Fontes desconhecidas" e instale.</p>
              <p><strong>iOS:</strong> Em breve na App Store.</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${downloadPageUrl}" class="download-button">
                🔗 Acesse a Página de Download Completa
              </a>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>💡 Dica:</strong> Salve este email! Você pode usar estes links sempre que precisar baixar o app novamente.</p>
            </div>

            <div class="footer">
              <p>Precisa de ajuda? Responda este email ou entre em contato:</p>
              <p><strong>suporte@dindinmagico.com</strong></p>
              <p>Responderemos em até 24 horas</p>
              <hr style="margin: 20px 0;">
              <p>DinDin Mágico - Seu controle financeiro pessoal</p>
            </div>
          </div>
        </body>
      </html>
    `;

    logStep("Sending email with Gmail SMTP");

    try {
      await client.send({
        from: gmailUser,
        to: email,
        subject: "🎉 Seu DinDin Mágico está pronto para download!",
        html: emailHtml,
      });
      
      logStep("Email sent successfully");
      
    } catch (emailError) {
      logStep("Error sending email", { error: emailError.message });
      throw emailError;
    } finally {
      try {
        await client.close();
        logStep("SMTP connection closed");
      } catch (closeError) {
        logStep("Error closing SMTP connection", { error: closeError.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso via Gmail" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-download-email", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});