import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, Target, Gift, TrendingUp, Calendar, Zap, Award } from 'lucide-react';
import PremiumGuard from './PremiumGuard';
import CelebrationModal from './CelebrationModal';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  emoji: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  category: 'spending' | 'saving' | 'goals' | 'consistency';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const achievementDefinitions: Omit<Achievement, 'progress' | 'isUnlocked'>[] = [
  // Spending achievements
  {
    id: 'first_expense',
    title: 'Primeiro Passo',
    description: 'Registrou seu primeiro gasto',
    icon: Target,
    emoji: '🥇',
    maxProgress: 1,
    category: 'spending',
    rarity: 'common'
  },
  {
    id: 'expense_week',
    title: 'Controlador Semanal',
    description: 'Registrou gastos por 7 dias seguidos',
    icon: Calendar,
    emoji: '📅',
    maxProgress: 7,
    category: 'consistency',
    rarity: 'rare'
  },
  
  // Saving achievements
  {
    id: 'first_saving',
    title: 'Poupador Iniciante',
    description: 'Economizou seus primeiros R$ 100',
    icon: Gift,
    emoji: '💰',
    maxProgress: 100,
    category: 'saving',
    rarity: 'common'
  },
  {
    id: 'saving_master',
    title: 'Mestre da Economia',
    description: 'Economizou R$ 1.000',
    icon: Trophy,
    emoji: '🏆',
    maxProgress: 1000,
    category: 'saving',
    rarity: 'epic'
  },
  
  // Goals achievements
  {
    id: 'first_goal',
    title: 'Sonhador',
    description: 'Criou sua primeira meta',
    icon: Star,
    emoji: '⭐',
    maxProgress: 1,
    category: 'goals',
    rarity: 'common'
  },
  {
    id: 'goal_achiever',
    title: 'Realizador de Sonhos',
    description: 'Completou sua primeira meta',
    icon: Award,
    emoji: '🎯',
    maxProgress: 1,
    category: 'goals',
    rarity: 'legendary'
  },
  
  // Consistency achievements
  {
    id: 'streak_7',
    title: 'Consistente',
    description: 'Usou o app por 7 dias seguidos',
    icon: Zap,
    emoji: '⚡',
    maxProgress: 7,
    category: 'consistency',
    rarity: 'rare'
  },
  {
    id: 'spending_trend',
    title: 'Tendência Positiva',
    description: 'Reduziu gastos por 3 meses consecutivos',
    icon: TrendingUp,
    emoji: '📈',
    maxProgress: 3,
    category: 'spending',
    rarity: 'epic'
  }
];

const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    achievement?: Achievement;
  }>({ isOpen: false });
  const { user } = useAuth();

  const rarityColors = {
    common: 'bg-gray-100 border-gray-300 text-gray-800',
    rare: 'bg-blue-100 border-blue-300 text-blue-800',
    epic: 'bg-purple-100 border-purple-300 text-purple-800',
    legendary: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  };

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      // Simulate achievements storage in localStorage for now
      const userAchievementsKey = `achievements_${user.id}`;
      const userAchievements = JSON.parse(localStorage.getItem(userAchievementsKey) || '[]');

      // Calculate current progress for each achievement
      const achievementsWithProgress = await Promise.all(
        achievementDefinitions.map(async (def) => {
          const userAchievement = userAchievements.find((ua: any) => ua.achievement_id === def.id);
          const progress = await calculateProgress(def.id);
          
          return {
            ...def,
            progress: progress,
            isUnlocked: userAchievement?.unlocked_at !== null || progress >= def.maxProgress
          };
        })
      );

      setAchievements(achievementsWithProgress);
      
      // Check for newly unlocked achievements
      checkForNewUnlocks(achievementsWithProgress, userAchievements || []);
      
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const calculateProgress = async (achievementId: string): Promise<number> => {
    if (!user) return 0;

    try {
      switch (achievementId) {
        case 'first_expense': {
          const { count } = await supabase
            .from('expenses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          return Math.min(count || 0, 1);
        }
        
        case 'expense_week': {
          // Check for 7 consecutive days with expenses
          const { data } = await supabase
            .from('expenses')
            .select('date')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
          
          if (!data || data.length === 0) return 0;
          
          const uniqueDates = [...new Set(data.map(e => e.date))].sort().reverse();
          let streak = 0;
          let currentDate = new Date();
          
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            
            if (uniqueDates.includes(checkDateStr)) {
              streak++;
            } else {
              break;
            }
          }
          
          return streak;
        }
        
        case 'first_saving':
        case 'saving_master': {
          // Calculate total saved (income - expenses)
          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id);
            
          const { data: income } = await supabase
            .from('income_entries')
            .select('amount')
            .eq('user_id', user.id);
          
          const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
          const totalIncome = income?.reduce((sum, i) => sum + i.amount, 0) || 0;
          const saved = Math.max(0, totalIncome - totalExpenses);
          
          return achievementId === 'first_saving' ? Math.min(saved, 100) : Math.min(saved, 1000);
        }
        
        case 'first_goal': {
          const { count } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          return Math.min(count || 0, 1);
        }
        
        case 'goal_achiever': {
          const { data: goals } = await supabase
            .from('goals')
            .select('current_amount, target_amount')
            .eq('user_id', user.id);
          
          const completedGoals = goals?.filter(g => 
            (g.current_amount || 0) >= g.target_amount
          ).length || 0;
          
          return Math.min(completedGoals, 1);
        }
        
        case 'streak_7': {
          // Simple implementation - check profile for consecutive days
          const { data: profile } = await supabase
            .from('profiles')
            .select('last_activity_streak')
            .eq('id', user.id)
            .single();
          return Math.min(profile?.last_activity_streak || 0, 7);
        }
        
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Error calculating progress for ${achievementId}:`, error);
      return 0;
    }
  };

  const checkForNewUnlocks = async (currentAchievements: Achievement[], userAchievements: any[]) => {
    const newlyUnlocked = currentAchievements.filter(achievement => {
      const wasUnlocked = userAchievements.find((ua: any) => ua.achievement_id === achievement.id)?.unlocked_at;
      return !wasUnlocked && achievement.progress >= achievement.maxProgress;
    });

    for (const achievement of newlyUnlocked) {
      // Save to localStorage for now
      const userAchievementsKey = `achievements_${user?.id}`;
      const currentUserAchievements = JSON.parse(localStorage.getItem(userAchievementsKey) || '[]');
      
      const newAchievement = {
        user_id: user?.id,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString(),
        progress: achievement.progress
      };
      
      currentUserAchievements.push(newAchievement);
      localStorage.setItem(userAchievementsKey, JSON.stringify(currentUserAchievements));

      // Show celebration
      setCelebrationModal({
        isOpen: true,
        achievement
      });
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return (achievement.progress / achievement.maxProgress) * 100;
  };

  return (
    <>
      <PremiumGuard feature="sistema de conquistas">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Conquistas Mágicas
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const percentage = getProgressPercentage(achievement);
              
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    achievement.isUnlocked 
                      ? rarityColors[achievement.rarity] + ' shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      achievement.isUnlocked ? 'bg-white/50' : 'bg-gray-200'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          {achievement.title}
                          <span className="text-lg">{achievement.emoji}</span>
                        </h4>
                        <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm opacity-75">{achievement.description}</p>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progresso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </PremiumGuard>

      <CelebrationModal
        isOpen={celebrationModal.isOpen}
        onClose={() => setCelebrationModal({ isOpen: false })}
        type="badge_earned"
        title={`Conquista Desbloqueada! ${celebrationModal.achievement?.emoji}`}
        description={celebrationModal.achievement?.title || ''}
        achievementData={{
          badge: celebrationModal.achievement?.title,
          emoji: celebrationModal.achievement?.emoji
        }}
      />
    </>
  );
};

export default AchievementSystem;