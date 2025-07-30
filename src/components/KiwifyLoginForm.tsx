import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const KiwifyLoginForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'success'>('email');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleKiwifyLogin = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite o email usado na compra do Kiwify.",
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
      
      // Verificar se existe compra no Kiwify
      const { data, error } = await supabase.functions.invoke('verify-kiwify-purchase', {
        body: { email }
      });

      if (error) throw error;

      if (data.hasValidPurchase) {
        // Tentar fazer login automático
        try {
          const { error: signInError } = await signIn(email, 'kiwify_temp_password');
          
          if (!signInError) {
            // Login bem-sucedido
            setStep('success');
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            return;
          }
        } catch (loginError) {
          console.log('Login automático falhou, criando conta...');
        }

        // Se login falhou, criar conta automaticamente
        await createKiwifyAccount(email, data.customerData);
        
      } else {
        toast({
          title: "Compra não encontrada",
          description: "Não encontramos uma compra aprovada para este email no Kiwify.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no login Kiwify:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createKiwifyAccount = async (email: string, customerData: any) => {
    try {
      // Criar conta via admin API
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: `kiwify_${Date.now()}`, // Senha temporária
        email_confirm: true,
        user_metadata: {
          full_name: customerData?.name || email.split('@')[0],
          kiwify_customer_id: customerData?.id,
          created_via: 'kiwify'
        }
      });

      if (createError) throw createError;

      // Ativar premium
      if (userData.user) {
        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            subscription_status: 'active',
            kiwify_customer_id: customerData?.id
          })
          .eq('id', userData.user.id);

        // Fazer login
        await signIn(email, `kiwify_${Date.now()}`);
        
        setStep('success');
        
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Sua conta foi criada e ativada automaticamente.",
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar conta Kiwify:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Entre em contato com o suporte para ativar sua conta.",
        variant: "destructive",
      });
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-magical flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-success/20 bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-success mb-2">Conta Ativada! 🎉</h2>
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
          <p className="text-white/80">Acesso para clientes Kiwify</p>
        </div>

        {/* Login Form */}
        <Card className="border-primary/20 shadow-magical bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Acessar Minha Conta
            </CardTitle>
            <p className="text-muted-foreground">
              Digite o email usado na compra do Kiwify
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email da compra no Kiwify</Label>
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
              onClick={handleKiwifyLogin}
              disabled={loading}
              className="w-full bg-gradient-success hover:opacity-90"
              size="lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Verificando compra...' : 'Acessar Conta'}
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2">ℹ️ Como funciona:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Digite o email usado na compra do Kiwify</li>
                <li>• Verificamos automaticamente sua compra</li>
                <li>• Sua conta é criada e ativada instantaneamente</li>
                <li>• Acesso premium liberado imediatamente</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não comprou?{" "}
                <button 
                  onClick={() => navigate('/')}
                  className="text-primary hover:underline font-medium"
                >
                  Ver oferta especial
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

export default KiwifyLoginForm;