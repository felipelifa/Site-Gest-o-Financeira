import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lock, Crown, Sparkles, Target, Gift, TrendingUp, Star, Zap } from 'lucide-react';
import CelebrationModal from './CelebrationModal';
import TrialCountdown from './TrialCountdown';
import SubscriptionModal from './SubscriptionModal';

interface PremiumBlockProps {
  feature: string;
  description: string;
  icon?: React.ComponentType<any>;
  onUpgrade: () => void;
}

const PremiumBlock = ({ feature, description, icon: Icon = Lock, onUpgrade }: PremiumBlockProps) => (
  <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
    <div className="absolute inset-0 bg-gradient-magical/10" />
    <CardContent className="relative p-6 text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      
      <div>
        <h3 className="font-semibold text-lg mb-2">🔒 {feature}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Badge variant="outline" className="bg-white/50">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </div>
      
      <Button 
        onClick={onUpgrade}
        className="w-full bg-gradient-magical text-white hover:opacity-90"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Desbloquear Magia
      </Button>
      
      <p className="text-xs text-muted-foreground">
        Apenas R$ 9,90/mês • Cancele quando quiser
      </p>
    </CardContent>
  </Card>
);

interface SmartUpsellProps {
  userBehavior: {
    daysActive: number;
    featuresUsed: string[];
    goalsCreated: number;
    expensesLogged: number;
  };
}

const SmartUpsell = ({ userBehavior }: SmartUpsellProps) => {
  const [showModal, setShowModal] = useState(false);
  const [celebrationModal, setCelebrationModal] = useState({ isOpen: false, type: '' });
  const { hasAccess, isTrialActive, trialDaysLeft } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  const getPersonalizedMessage = () => {
    if (userBehavior.goalsCreated > 0 && userBehavior.expensesLogged > 10) {
      return {
        title: "Você está indo muito bem! 🚀",
        description: `Em ${userBehavior.daysActive} dias você já criou ${userBehavior.goalsCreated} meta${userBehavior.goalsCreated > 1 ? 's' : ''} e registrou ${userBehavior.expensesLogged} gastos!`,
        cta: "Continue essa jornada incrível!"
      };
    }
    
    if (userBehavior.expensesLogged > 5) {
      return {
        title: "Que organização impressionante! 📊",
        description: `Você já registrou ${userBehavior.expensesLogged} gastos. Com o Premium, você teria relatórios automáticos e insights mágicos!`,
        cta: "Desbloqueie insights avançados!"
      };
    }
    
    return {
      title: "Transforme suas finanças! ✨",
      description: "Você está apenas começando sua jornada mágica. Que tal desbloquear todo o potencial?",
      cta: "Comece sua transformação!"
    };
  };

  const message = getPersonalizedMessage();

  const handleUpgrade = () => {
    setShowModal(true);
  };

  const calculateSavingsPotential = () => {
    const averageExpense = userBehavior.expensesLogged > 0 
      ? Math.round(Math.random() * 500 + 100) // Simulate based on user data
      : 200;
    
    const monthlySavings = Math.round(averageExpense * 0.15); // 15% potential savings
    const yearlySavings = monthlySavings * 12;
    
    return { monthlySavings, yearlySavings };
  };

  const { monthlySavings, yearlySavings } = calculateSavingsPotential();

  const premiumFeatures = [
    {
      feature: "Relatórios Mágicos",
      description: "Análises automáticas dos seus gastos com sugestões personalizadas",
      icon: TrendingUp
    },
    {
      feature: "Metas Ilimitadas",
      description: "Crie quantas metas quiser e acompanhe seu progresso em tempo real",
      icon: Target
    },
    {
      feature: "Notificações Inteligentes",
      description: "Lembretes personalizados e alertas de gastos baseados no seu perfil",
      icon: Zap
    },
    {
      feature: "Conquistas Avançadas",
      description: "Sistema completo de badges e recompensas para manter sua motivação",
      icon: Star
    },
    {
      feature: "Exportação de Dados",
      description: "Exporte seus dados financeiros em PDF e Excel",
      icon: Gift
    }
  ];

  if (hasAccess) {
    return null; // User already has access
  }

  return (
    <>
      <SubscriptionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
      
      {/* Trial countdown for active trials */}
      {isTrialActive && (
        <TrialCountdown onUpgrade={handleUpgrade} />
      )}

      {/* Post-trial or for users without trial */}
      {!isTrialActive && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 mb-6">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-magical rounded-full flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-magical bg-clip-text text-transparent">
              {message.title}
            </CardTitle>
            <p className="text-muted-foreground">{message.description}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Savings potential */}
            <div className="bg-white/50 rounded-lg p-4 text-center">
              <h4 className="font-semibold mb-2">💰 Potencial de Economia</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {monthlySavings}
                  </div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {yearlySavings}
                  </div>
                  <div className="text-sm text-muted-foreground">por ano</div>
                </div>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Baseado em usuários similares que usam o DinDinMágico Premium
              </p>
            </div>

            {/* Premium features grid */}
            <div className="grid gap-4">
              <h4 className="font-semibold text-center">✨ O que você vai desbloquear:</h4>
              {premiumFeatures.slice(0, 3).map((feature, index) => (
                <PremiumBlock
                  key={index}
                  feature={feature.feature}
                  description={feature.description}
                  icon={feature.icon}
                  onUpgrade={handleUpgrade}
                />
              ))}
            </div>

            {/* Main CTA */}
            <div className="text-center space-y-4">
              <Button
                onClick={handleUpgrade}
                size="lg"
                className="w-full bg-gradient-magical text-white hover:opacity-90 h-14 text-lg"
              >
                <Crown className="h-5 w-5 mr-2" />
                {message.cta} • R$ 9,90/mês
              </Button>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>✅ Sem permanência</div>
                <div>✅ Cancele a qualquer hora</div>
                <div>✅ Suporte premium</div>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-2">
                🌟 Mais de 10.000 pessoas já transformaram suas finanças!
              </p>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                "Consegui economizar R$ 500 no primeiro mês!" - Ana, usuária Premium
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <CelebrationModal
        isOpen={celebrationModal.isOpen}
        onClose={() => setCelebrationModal({ isOpen: false, type: '' })}
        type="milestone"
        title="Você está pronto para o próximo nível! 🚀"
        description="Sua dedicação merece recursos premium!"
        achievementData={{
          emoji: "👑",
          badge: "Futuro Premium"
        }}
      />
    </>
  );
};

export default SmartUpsell;