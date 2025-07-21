import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Gift, Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'goal_progress' | 'expense_saved' | 'badge_earned' | 'milestone';
  title: string;
  description: string;
  achievementData?: {
    badge?: string;
    amount?: number;
    progress?: number;
    emoji?: string;
  };
}

const celebrationTypes = {
  goal_progress: {
    icon: Target,
    gradient: 'from-green-400 to-emerald-600',
    confettiColors: ['#10b981', '#34d399', '#6ee7b7']
  },
  expense_saved: {
    icon: Gift,
    gradient: 'from-blue-400 to-cyan-600',
    confettiColors: ['#3b82f6', '#60a5fa', '#93c5fd']
  },
  badge_earned: {
    icon: Trophy,
    gradient: 'from-yellow-400 to-orange-600',
    confettiColors: ['#f59e0b', '#fbbf24', '#fcd34d']
  },
  milestone: {
    icon: Star,
    gradient: 'from-purple-400 to-pink-600',
    confettiColors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
  }
};

const CelebrationModal = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  description, 
  achievementData 
}: CelebrationModalProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const config = celebrationTypes[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      
      // Trigger confetti animation (simple CSS-based)
      const triggerConfetti = async () => {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: config.confettiColors
          });
        } catch (error) {
          // Fallback to simple animation if confetti fails
          console.log('Confetti animation unavailable');
        }
      };

      triggerConfetti();
      setTimeout(triggerConfetti, 500);
      setTimeout(triggerConfetti, 1000);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen, config.confettiColors]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 bg-transparent shadow-none">
        <div className={`
          relative bg-gradient-to-br ${config.gradient} rounded-2xl p-8 text-white text-center
          ${showAnimation ? 'animate-scale-in' : ''}
        `}>
          {/* Sparkles decoration */}
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Main icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Icon className="h-10 w-10" />
            </div>
          </div>

          {/* Achievement emoji/badge */}
          {achievementData?.emoji && (
            <div className="text-4xl mb-4 animate-pulse">
              {achievementData.emoji}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          
          {/* Description */}
          <p className="text-lg opacity-90 mb-6">{description}</p>

          {/* Achievement details */}
          {achievementData && (
            <div className="space-y-3 mb-6">
              {achievementData.badge && (
                <Badge className="bg-white/20 text-white border-white/30 text-sm py-1 px-3">
                  🏆 {achievementData.badge}
                </Badge>
              )}
              
              {achievementData.amount && (
                <div className="text-xl font-semibold">
                  R$ {achievementData.amount.toLocaleString('pt-BR')}
                </div>
              )}
              
              {achievementData.progress && (
                <div className="text-sm">
                  {achievementData.progress}% do seu objetivo alcançado!
                </div>
              )}
            </div>
          )}

          {/* Motivational messages */}
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm">
              {type === 'goal_progress' && "Você está no caminho certo! Continue assim! 🚀"}
              {type === 'expense_saved' && "Cada economia te aproxima dos seus sonhos! ✨"}
              {type === 'badge_earned' && "Conquista desbloqueada! Você é incrível! 🌟"}
              {type === 'milestone' && "Marco importante atingido! Você é um mágico das finanças! 🎯"}
            </p>
          </div>

          {/* Action button */}
          <Button
            onClick={onClose}
            className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold"
          >
            Continuar a jornada mágica! ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;