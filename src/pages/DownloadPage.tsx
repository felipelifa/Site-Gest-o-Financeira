import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Download, Smartphone, Mail, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DownloadPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromUrl = searchParams.get('email');
  const paymentStatus = searchParams.get('payment');
  const [email, setEmail] = useState(emailFromUrl || "");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const { toast } = useToast();

  // Verificar acesso quando a página carrega ou email muda
  useEffect(() => {
    // Se veio do pagamento com sucesso, dar acesso automaticamente
    if (paymentStatus === 'success' && email) {
      setHasAccess(true);
      setAccessChecked(true);
      toast({
        title: "Pagamento aprovado! 🎉",
        description: "Seu acesso foi liberado. Faça o download do app abaixo.",
      });
      return;
    }

    // Se veio com pagamento pendente, aguardar confirmação
    if (paymentStatus === 'pending' && email) {
      toast({
        title: "Pagamento em processamento ⏳",
        description: "Aguardando confirmação do pagamento. Verificando automaticamente...",
      });
      // Verificar a cada 5 segundos se foi aprovado
      const interval = setInterval(() => {
        verifyPaymentAccess();
      }, 5000);
      
      // Limpar interval após 2 minutos
      setTimeout(() => clearInterval(interval), 120000);
      
      return () => clearInterval(interval);
    }
    
    if (email) {
      verifyPaymentAccess();
    }
  }, [email, paymentStatus]);

  const verifyPaymentAccess = async () => {
    if (!email) return;
    
    try {
      setVerifying(true);
      console.log('🔥 DOWNLOAD: Verificando pagamento para email:', email);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { email }
      });

      console.log('🔥 DOWNLOAD: Resposta do verify-payment:', { data, error });

      if (error) {
        console.error('🔥 DOWNLOAD: Erro na verificação:', error);
        throw error;
      }

      console.log('🔥 DOWNLOAD: Resultado da verificação:', data);
      setHasAccess(data.hasValidPayment);
      setAccessChecked(true);
      
      if (!data.hasValidPayment) {
        console.log('🔥 DOWNLOAD: Acesso negado. Orders encontradas:', data.orders);
        toast({
          title: "Acesso negado",
          description: "Nenhum pagamento aprovado encontrado para este email.",
          variant: "destructive",
        });
      } else {
        console.log('🔥 DOWNLOAD: Acesso liberado!');
      }
    } catch (error) {
      console.error('🔥 DOWNLOAD: Erro ao verificar pagamento:', error);
      setHasAccess(false);
      setAccessChecked(true);
      toast({
        title: "Erro",
        description: "Erro ao verificar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckEmail = () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para verificar o acesso.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    verifyPaymentAccess();
  };

  const handleSendEmail = async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('send-download-email', {
        body: { email }
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Link de download enviado para seu email.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadLinks = {
    android: "https://drive.google.com/drive/folders/1bLQhwXtOJDcNzBWZy8kHFGJqL5rN2mX9",
    ios: "https://apps.apple.com/app/SEU_APP_ID" // Atualizar quando estiver na App Store
  };

  // Se não tem acesso e já verificou, mostrar tela de bloqueio
  if (accessChecked && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-destructive/20 bg-gradient-to-r from-destructive/5 to-primary/5">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Acesso Restrito</CardTitle>
              <p className="text-muted-foreground">
                Digite o email usado na compra para acessar o download.
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Verificar Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Digite o email da compra"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCheckEmail}
                  disabled={verifying}
                  variant="accent"
                >
                  {verifying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Verificar"
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Use o mesmo email informado no checkout</p>
                <p>• O pagamento deve estar aprovado</p>
                <p>• Em caso de problemas, aguarde alguns minutos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ainda não comprou?
                </p>
                <Button 
                  onClick={() => navigate('/checkout')}
                  variant="magical"
                  className="w-full"
                >
                  Comprar DinDin Mágico - R$ 29,90
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tela de loading durante verificação
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Tela principal de download (só aparece se tem acesso)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Header */}
        <Card className="border-success/20 bg-gradient-to-r from-success/5 to-primary/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <CardTitle className="text-2xl text-success">Pagamento Confirmado!</CardTitle>
            <p className="text-muted-foreground">
              Obrigado pela compra, <strong>{email}</strong>! Seu DinDin Mágico está pronto para download.
            </p>
          </CardHeader>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Faça o Download do App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Android Download */}
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Android</h3>
                    <p className="text-sm text-muted-foreground">Para smartphones Android</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open(downloadLinks.android, '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Download APK
                </Button>
              </div>
            </div>

            {/* iOS Download */}
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">iPhone/iPad</h3>
                    <p className="text-sm text-muted-foreground">Para dispositivos iOS</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open(downloadLinks.ios, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  App Store
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Receber Link por Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-muted/50 text-muted-foreground"
              />
              <Button 
                onClick={handleSendEmail}
                disabled={loading}
                variant="accent"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
            
            {emailSent && (
              <div className="flex items-center gap-3 text-success p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Email enviado para {email}</p>
                  <p className="text-sm text-muted-foreground">
                    Verifique sua caixa de entrada (e spam) para o link de download.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instruções de Instalação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Android:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Baixe o arquivo APK</li>
                <li>Habilite "Fontes desconhecidas" nas configurações</li>
                <li>Instale o arquivo baixado</li>
                <li>Abra o app e faça seu cadastro</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">iOS:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Toque no link da App Store</li>
                <li>Instale o app normalmente</li>
                <li>Abra o app e faça seu cadastro</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Precisa de ajuda? Entre em contato:
              </p>
              <p className="font-medium">suporte@dindinmagico.com</p>
              <p className="text-sm text-muted-foreground">
                Responderemos em até 24 horas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DownloadPage;
