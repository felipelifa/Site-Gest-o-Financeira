import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, X } from "lucide-react";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'trial_expired' | 'premium_feature';
  feature?: string;
}

const UpgradeModal = ({ isOpen, onClose, reason = 'trial_expired', feature }: UpgradeModalProps) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const getTitle = () => {
    if (reason === 'premium_feature') {
      return '🚀 Recurso Premium';
    }
    return '⏰ Seu teste grátis acabou!';
  };

  const getDescription = () => {
    if (reason === 'premium_feature' && feature) {
      return `Para usar ${feature}, você precisa ser Premium.`;
    }
    return 'Continue acompanhando seus gastos e realizando seus sonhos.';
  };

  const handleSubscribe = () => {
    setShowSubscriptionModal(true);
    onClose();
  };

  return (
    <>
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-center">
            <div>
              <p className="text-muted-foreground mb-2">
                {getDescription()}
              </p>
              <p className="text-lg font-semibold text-primary">
                Desbloqueie todo o poder por apenas <span className="text-2xl">R$ 9,90/mês</span>
              </p>
            </div>

            {/* Features destaque */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>✨ Adicionar novos gastos e metas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>📊 Relatórios detalhados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>📱 WhatsApp integrado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>📤 Exportar dados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>🎯 Metas ilimitadas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-magical text-white hover:opacity-90 h-12 text-lg"
                size="lg"
              >
                <Crown className="h-5 w-5 mr-2" />
                Assinar Agora
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Talvez mais tarde
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Você pode cancelar a qualquer momento
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpgradeModal;