import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { Clock, Crown, Sparkles, Zap } from 'lucide-react';

interface TrialCountdownProps {
  onUpgrade: () => void;
}

const TrialCountdown = ({ onUpgrade }: TrialCountdownProps) => {
  const { isTrialActive, trialDaysLeft, isPremium } = useSubscription();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!isTrialActive || isPremium) return;

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTrialActive, isPremium]);

  if (!isTrialActive || isPremium) return null;

  const getUrgencyLevel = () => {
    if (trialDaysLeft <= 1) return 'critical';
    if (trialDaysLeft <= 2) return 'urgent';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();
  const progressPercentage = ((7 - trialDaysLeft) / 7) * 100;

  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          gradient: 'from-red-500 to-pink-600',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          pulseColor: 'bg-red-500'
        };
      case 'urgent':
        return {
          gradient: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
          pulseColor: 'bg-orange-500'
        };
      default:
        return {
          gradient: 'from-blue-500 to-purple-600',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          pulseColor: 'bg-blue-500'
        };
    }
  };

  const styles = getUrgencyStyles();

  const getMessage = () => {
    if (trialDaysLeft === 0) {
      return {
        title: "⚡ Último dia de magia total!",
        subtitle: `Ainda restam ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`,
        description: "Não perca sua varinha mágica financeira!"
      };
    }
    if (trialDaysLeft === 1) {
      return {
        title: "🔥 Apenas 1 dia restante!",
        subtitle: "Sua jornada mágica está quase acabando",
        description: "Continue transformando sonhos em realidade!"
      };
    }
    return {
      title: `✨ ${trialDaysLeft} dias de magia restantes`,
      subtitle: "Aproveite todos os recursos premium",
      description: "Cada dia conta na sua jornada financeira!"
    };
  };

  const message = getMessage();

  return (
    <Card className={`relative overflow-hidden ${styles.bgColor} border-2 mb-4 shadow-lg`}>
      {/* Animated background effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} opacity-5`} />
      
      {/* Pulse effect for urgency */}
      {urgencyLevel === 'critical' && (
        <div className={`absolute top-0 right-0 w-3 h-3 ${styles.pulseColor} rounded-full animate-ping m-2`} />
      )}

      <div className="relative p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-5 w-5 ${styles.textColor}`} />
              <h3 className={`font-bold ${styles.textColor} text-lg`}>
                {message.title}
              </h3>
            </div>
            
            <p className={`${styles.textColor} font-medium mb-1`}>
              {message.subtitle}
            </p>
            
            <p className={`text-sm ${styles.textColor} opacity-75`}>
              {message.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1 text-sm font-bold ${styles.textColor}`}>
              <Sparkles className="h-4 w-4" />
              <span>{trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''}</span>
            </div>
            
            {trialDaysLeft === 0 && (
              <div className={`text-xs font-mono ${styles.textColor} bg-white/50 px-2 py-1 rounded`}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={styles.textColor}>Progresso do trial</span>
            <span className={styles.textColor}>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onUpgrade}
            className={`flex-1 bg-gradient-to-r ${styles.gradient} hover:opacity-90 text-white font-semibold`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Manter a magia! R$ 9,90/mês
          </Button>
          
          {urgencyLevel === 'critical' && (
            <Button
              variant="outline"
              size="sm"
              className={`${styles.textColor} border-current hover:bg-white/50`}
              onClick={() => {
                // Lembrete para mais tarde
                localStorage.setItem('dindin_trial_reminder', Date.now().toString());
              }}
            >
              <Zap className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Benefits reminder */}
        <div className="mt-3 p-3 bg-white/50 rounded-lg">
          <p className={`text-xs ${styles.textColor} font-medium`}>
            💡 <strong>O que você vai perder:</strong> Metas ilimitadas, relatórios mágicos, 
            notificações inteligentes e muito mais!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TrialCountdown;