import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, Sparkles, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const EmailLoginPage = () => {
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'success'>('email');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pegar email da URL se fornecido
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setInitialEmail(emailFromUrl);
    }
  }, []);

const handleEmailLogin = async () => {
  if (!email) {
    toast({
      title: "Email obrigatório",
      description: "Digite seu email para acessar sua conta.",
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

  try {
    setLoading(true);

    // 1. Chamar função edge para verificar pagamento e gerar tokens
    const response = await fetch("https://dindinmagico.netlify.app/.netlify/functions/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!result.hasValidPayment || !result.access_token || !result.refresh_token) {
      throw new Error("Nenhum pagamento aprovado encontrado. Verifique seu email ou entre em contato com o suporte.");
    }

    // 2. Usar tokens para logar o usuário automaticamente
    const { error } = await supabase.auth.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Login realizado! 🎉",
      description: "Redirecionando para o dashboard...",
    });

    setStep("success");

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);

  } catch (error: any) {
    console.error("Erro ao logar:", error);
    toast({
      title: "Erro no login",
      description: error.message || "Não conseguimos validar o acesso.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};



      
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);

      if (userError || !existingUser.user) {
        toast({
          title: "Conta não encontrada",
          description: "Não encontramos uma conta com este email. Deseja criar uma conta?",
          variant: "destructive",
        });
        
        // Oferecer opção de criar conta
        setTimeout(() => {
          if (confirm("Deseja criar uma conta com este email?")) {
            navigate(`/create-account?email=${encodeURIComponent(email)}`);
          }
        }, 2000);
        return;
      }

      // Tentar diferentes senhas temporárias baseadas no padrão usado
      const possiblePasswords = [
        `temp_${email.split('@')[0]}_${Date.now()}`,
        `temp_${email.split('@')[0]}_${existingUser.user.created_at}`,
        `kiwify_temp_password`,
        `dindin_${email.split('@')[0]}`,
      ];

      let loginSuccess = false;
      
      for (const password of possiblePasswords) {
        try {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (!loginError) {
            loginSuccess = true;
            break;
          }
        } catch (e) {
          // Continuar tentando outras senhas
          continue;
        }
      }
      
      if (!loginSuccess) {
        throw new Error('Não foi possível fazer login automaticamente. Entre em contato com o suporte.');
      }
      
      setStep('success');
      
      toast({
        title: "Login realizado! 🎉",
        description: "Redirecionando para o dashboard...",
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro no login por email:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-magical flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-success/20 bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-success mb-2">Login realizado! 🎉</h2>
              <p className="text-muted-foreground">
                Redirecionando para o dashboard...
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-magical flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary-glow" />
            <h1 className="text-3xl font-bold text-white">DinDinMágico</h1>
          </div>
          <p className="text-white/80">Acesse sua conta</p>
        </div>

        {/* Login Form */}
        <Card className="border-primary/20 shadow-magical bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Entrar na Minha Conta
            </CardTitle>
            <p className="text-muted-foreground">
              Digite apenas seu email para acessar
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  required
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
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2">ℹ️ Como funciona:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Digite o email usado na compra</li>
                <li>• Não precisa de senha</li>
                <li>• Acesso automático à sua conta</li>
                <li>• Seus dados ficam seguros e privados</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não tem conta?{" "}
                <button 
                  onClick={() => navigate('/create-account')}
                  className="text-primary hover:underline font-medium"
                >
                  Criar conta
                </button>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Quer comprar o app?{" "}
                <button 
                  onClick={() => navigate('/checkout')}
                  className="text-primary hover:underline font-medium"
                >
                  Ir para checkout
                </button>
              </p>
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

export default EmailLoginPage;