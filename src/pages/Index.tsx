import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Sparkles, CheckCircle, CreditCard, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoginLoading, setAutoLoginLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Verificar parâmetros da URL (retorno do pagamento)
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const paymentStatus = searchParams.get('payment');
    
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    
    if (paymentStatus === 'success' && emailFromUrl) {
      toast({
        title: "Pagamento aprovado! 🎉",
        description: "Verificando seu acesso automaticamente...",
      });
      
      // Tentar login automático após pagamento aprovado
      setTimeout(() => {
        handleEmailLoginWithEmail(emailFromUrl);
      }, 2000);
    } else if (paymentStatus === 'failure') {
      toast({
        title: "Pagamento não aprovado",
        description: "Houve um problema com o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } else if (paymentStatus === 'pending') {
      toast({
        title: "Pagamento em processamento",
        description: "Aguarde a confirmação do pagamento para liberar o acesso.",
      });
    }
  }, [searchParams]);

  // Se já está logado, redirecionar para dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Tentar login automático se já existe sessão
  const handleAutoLogin = async () => {
    setAutoLoginLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        toast({
          title: "Login automático realizado! ✨",
          description: "Redirecionando para o dashboard...",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Nenhuma sessão encontrada",
          description: "Digite seu email para entrar ou faça uma nova compra.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login automático",
        description: "Tente digitar seu email manualmente.",
        variant: "destructive",
      });
    } finally {
      setAutoLoginLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    await handleEmailLoginWithEmail(email);
  };

  const handleEmailLoginWithEmail = async (emailToVerify: string) => {
    if (!emailToVerify) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para verificar o acesso.",
        variant: "destructive",
      });
      return;
    }

    if (!emailToVerify.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Chamar Edge Function para verificar pagamento
      const { data, error } = await supabase.functions.invoke('verify-payment-access', {
        body: { email: emailToVerify }
      });

      if (error) {
        throw error;
      }

      if (data.hasValidPayment && data.access_token && data.refresh_token) {
        // Configurar sessão automaticamente
        const { error: authError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (authError) {
          throw authError;
        }

        toast({
          title: "Acesso liberado! 🎉",
          description: "Redirecionando para o dashboard...",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Nenhum pagamento válido encontrado
        toast({
          title: "Acesso não encontrado",
          description: "Nenhum pagamento aprovado encontrado para este email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: error.message || "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-magical flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">DinDin</h1>
              <h1 className="text-4xl font-bold text-yellow-300">Mágico</h1>
            </div>
          </div>
          <p className="text-xl text-white/90">
            Transforme sua vida financeira
          </p>
          <p className="text-white/70">
            Controle seus gastos de forma simples e inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-white/20 shadow-magical bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Acessar Minha Conta
            </CardTitle>
            <p className="text-muted-foreground">
              Digite seu email para entrar na plataforma
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Login */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email da sua conta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-gradient-success hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Verificando acesso...' : 'Entrar'}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Auto Login */}
            <Button
              onClick={handleAutoLogin}
              disabled={autoLoginLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {autoLoginLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              {autoLoginLoading ? 'Verificando sessão...' : 'Entrar com minha conta'}
            </Button>

            {/* Info */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2">ℹ️ Como funciona:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Digite o email usado na compra</li>
                <li>• Verificamos automaticamente seu pagamento</li>
                <li>• Acesso liberado instantaneamente</li>
                <li>• Não precisa de senha ou confirmação</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Purchase CTA */}
        <Card className="border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Ainda não tem acesso?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adquira o DinDin Mágico e transforme sua vida financeira
                </p>
              </div>
              
              <Button
                onClick={handleGoToCheckout}
                className="w-full bg-gradient-accent hover:opacity-90"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Comprar Acesso - R$ 97,00
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span>🔒 Pagamento seguro</span>
                <span>⚡ Acesso imediato</span>
                <span>🛡️ Garantia de 30 dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-muted/20 bg-white/90">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Problemas para acessar?
            </p>
            <p className="text-sm font-medium">
              📧 suporte@dindinmagico.com
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Responderemos em até 24 horas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;