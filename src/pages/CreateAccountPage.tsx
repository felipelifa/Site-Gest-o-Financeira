import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, User, Mail, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const CreateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  const emailFromUrl = searchParams.get('email');
  const paymentStatus = searchParams.get('payment');
  
  const [email, setEmail] = useState(emailFromUrl || "");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast({
        title: "Pagamento aprovado! 🎉",
        description: "Agora vamos criar sua conta para acessar o app.",
      });
    }
  }, [paymentStatus, toast]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu nome e email para criar a conta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Gerar uma senha temporária única baseada no email e timestamp
      const tempPassword = `dindin_${email.split('@')[0]}_${Date.now()}`;
      
      const { error } = await signUp(email, tempPassword, fullName);
      
      if (!error) {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Redirecionando para o dashboard...",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Se der erro de email já existe, redirecionar para login
        if (error.message?.includes('already registered') || error.message?.includes('já está cadastrado')) {
          toast({
            title: "Email já cadastrado",
            description: "Redirecionando para o login...",
          });
          
          setTimeout(() => {
            navigate(`/email-login?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-white/80">Crie sua conta para acessar o app</p>
        </div>

        {/* Success indicator */}
        {paymentStatus === 'success' && (
          <Card className="border-success/20 bg-success/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 text-success">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Pagamento confirmado!</p>
                  <p className="text-sm">Agora vamos criar sua conta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Account Form */}
        <Card className="border-primary/20 shadow-magical bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Criar Minha Conta
            </CardTitle>
            <p className="text-muted-foreground">
              Preencha os dados para acessar o DinDin Mágico
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                    readOnly={!!emailFromUrl}
                  />
                </div>
                {emailFromUrl && (
                  <p className="text-xs text-muted-foreground">
                    Email do pagamento (não pode ser alterado)
                  </p>
                )}
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                <h4 className="font-semibold mb-2">ℹ️ Como funciona:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Sua conta será criada automaticamente</li>
                  <li>• Para entrar novamente, digite apenas seu email</li>
                  <li>• Não precisa lembrar de senha</li>
                  <li>• Seus dados ficam seguros e privados</li>
                </ul>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-success hover:opacity-90"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Criando conta...' : 'Criar Conta e Acessar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-muted/20 bg-white/90">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Problemas para criar a conta?
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

export default CreateAccountPage;