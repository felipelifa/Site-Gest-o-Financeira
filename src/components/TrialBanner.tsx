import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";

const TrialBanner = () => {
  const { isTrialActive, trialDaysLeft, isPremium } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Não mostrar mais - sem período grátis
  return null;

  const getUrgencyLevel = () => {
    if (trialDaysLeft <= 1) return "urgent";
    if (trialDaysLeft <= 3) return "warning";
    return "info";
  };

  const getUrgencyColors = () => {
    const level = getUrgencyLevel();
    switch (level) {
      case "urgent":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-orange-50 border-orange-200 text-orange-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getUrgencyMessage = () => {
    if (trialDaysLeft === 0) {
      return "⚠️ Seu teste grátis expira hoje!";
    }
    if (trialDaysLeft === 1) {
      return "⚠️ Falta apenas 1 dia para seu teste expirar!";
    }
    return `⏰ Faltam ${trialDaysLeft} dias para seu teste expirar!`;
  };

  return (
    <>
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      <Alert className={`${getUrgencyColors()} mb-4 shadow-soft`}>
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {getUrgencyMessage()}
            </div>
            <div className="text-sm mt-1">
              Não perca seus dados. Continue com acesso completo por apenas R$ 9,90/mês.
            </div>
          </div>
          <Button 
            size="sm"
            className="ml-4 bg-primary hover:bg-primary/90 text-white shrink-0"
            onClick={() => setShowSubscriptionModal(true)}
          >
            <Crown className="h-4 w-4 mr-1" />
            Assinar Agora
          </Button>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default TrialBanner;