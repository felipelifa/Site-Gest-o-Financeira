import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageCircle, Share2, Gift } from "lucide-react";
import SubscriptionModal from "./SubscriptionModal";

const PremiumSection = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  return (
    <>
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      <div className="space-y-6">
      {/* WhatsApp Integration */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>WhatsApp Mágico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Anote gastos direto pelo WhatsApp! Super prático 📱
          </p>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de anotar meus gastos pelo WhatsApp!', '_blank')}
          >
            Conectar WhatsApp
          </Button>
          <div className="text-xs text-muted-foreground">
            💡 Envie mensagens como "gastei 30 lanche" e pronto!
          </div>
        </CardContent>
      </Card>

      {/* Weekly Reports */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <span>Relatório Semanal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Seu resumo chegará toda segunda! 📊
          </p>
          <Button variant="outline" className="w-full">
            Ver Último Relatório
          </Button>
        </CardContent>
      </Card>

      {/* Premium CTA */}
      <Card className="bg-gradient-magical border-none text-white">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Gift className="h-8 w-8" />
            <div>
              <h3 className="font-bold">Desbloqueie Premium</h3>
              <p className="text-sm text-white/80">
                Mais metas, relatórios detalhados e rankings!
              </p>
              <Button 
                className="mt-2 bg-white text-accent hover:bg-white/90" 
                size="sm"
                onClick={() => setShowSubscriptionModal(true)}
              >
                Assinar por R$ 9,90/mês
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default PremiumSection;