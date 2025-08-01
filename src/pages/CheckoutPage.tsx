
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckoutPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para continuar com o pagamento.",
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
      console.log('🔥 CHECKOUT: Iniciando checkout para email:', email);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { email }
      });

      console.log('🔥 CHECKOUT: Resposta completa do create-payment:', { data, error });

      if (error) {
        console.error('🔥 CHECKOUT: Erro na resposta do create-payment:', error);
        throw error;
      }

      console.log('🔥 CHECKOUT: Dados recebidos do create-payment:', data);
      
      // Redirecionar para o MercadoPago
      if (data && data.init_point) {
        console.log('🔥 CHECKOUT: Redirecionando para o MercadoPago:', data.init_point);
        window.location.href = data.init_point;
      } else {
        console.error('🔥 CHECKOUT: Link de pagamento não encontrado na resposta:', data);
        throw new Error('Link de pagamento não recebido');
      }

    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      const errorMessage = error?.message || error?.toString() || "Erro ao processar pagamento. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white"
          >
            ← Voltar para o início
          </Button>
        </div>

        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-primary">DinDin Mágico</CardTitle>
            <p className="text-muted-foreground">
              Acesso vitalício por apenas <span className="font-bold text-accent">R$ 97,00</span>
            </p>
          </CardHeader>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">O que você vai receber:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-success/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm">App completo para Android e iOS</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Controle financeiro completo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-accent/10 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm">Acesso vitalício sem mensalidades</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Finalizar Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Seu email para receber o download</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p>✅ Pagamento 100% seguro via Mercado Pago</p>
              <p>✅ Link de download será enviado para seu email</p>
              <p>✅ Suporte técnico incluído</p>
            </div>

            <Button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="magical"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Pagar R$ 97,00"
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Ao continuar, você concorda com nossos termos de uso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
