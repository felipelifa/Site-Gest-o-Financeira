import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-mercadopago-subscription', {
        body: { plan_type: planType }
      });

      if (error) throw error;

      // Redirect to Mercado Pago
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        onClose();
      }

    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Metas ilimitadas",
    "Relatórios detalhados",
    "Análises avançadas",
    "WhatsApp integrado",
    "Backup automático",
    "Suporte prioritário"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            Dindin Mágico Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {/* Monthly Plan */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-semibold">Plano Mensal</h3>
                    <p className="text-2xl font-bold text-primary">R$ 9,90<span className="text-sm font-normal">/mês</span></p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('monthly')}
                  disabled={loading}
                  variant="accent"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Assinar Mensal'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Plano Anual</h3>
                      <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                        2 meses grátis
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-accent">R$ 99,00<span className="text-sm font-normal">/ano</span></p>
                    <p className="text-xs text-muted-foreground">R$ 8,25/mês</p>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('yearly')}
                  disabled={loading}
                  variant="magical"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Assinar Anual'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            Pagamento seguro via Mercado Pago
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;