import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Plus, Edit, Trash2, Sparkles, PiggyBank } from "lucide-react";
import GoalManager from "./GoalManager";
import AddGoalAmountDialog from "./AddGoalAmountDialog";
import PremiumGuard from "./PremiumGuard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
  deadline: string;
}

const GoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddAmountDialog, setShowAddAmountDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedGoals = data?.map(goal => ({
        id: goal.id,
        name: goal.name,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount || 0),
        emoji: goal.emoji || "🎯",
        deadline: goal.deadline,
      })) || [];

      setGoals(mappedGoals);
    } catch (error: any) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const openAddAmountDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowAddAmountDialog(true);
  };

  const closeAddAmountDialog = () => {
    setSelectedGoal(null);
    setShowAddAmountDialog(false);
  };

  return (
    <PremiumGuard feature="gestão de metas">
      <Card className="shadow-magical">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-accent">
              <Target className="h-5 w-5" />
              <span>Meus Sonhos</span>
            </CardTitle>
            <GoalManager onGoalsUpdate={setGoals} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Que tal definir seu primeiro sonho? 🌟
              </p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const progressClamped = Math.min(progress, 100);
              
              return (
                <div key={goal.id} className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div>
                        <h4 className="font-semibold">{goal.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Meta: {goal.deadline}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">
                        {progressClamped.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={progressClamped} className="h-3 mb-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Faltam R$ {(goal.target_amount - goal.current_amount).toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {progress >= 100 ? (
                        <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
                          Conquistado! 🎉
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddAmountDialog(goal)}
                          className="h-7 px-2 text-xs"
                        >
                          <PiggyBank className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Add Amount Dialog */}
      {selectedGoal && (
        <AddGoalAmountDialog
          isOpen={showAddAmountDialog}
          onClose={closeAddAmountDialog}
          goal={selectedGoal}
          onAmountAdded={loadGoals}
        />
      )}
    </PremiumGuard>
  );
};

export default GoalsSection;