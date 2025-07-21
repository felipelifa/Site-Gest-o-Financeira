import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Plus, Sparkles } from "lucide-react";
import GoalManager from "./GoalManager";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  deadline: string;
}

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal?: () => void;
}

const GoalTracker = ({ goals, onAddGoal }: GoalTrackerProps) => {
  return (
    <Card className="shadow-magical border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-accent">
            <Target className="h-5 w-5" />
            <span>Meus Sonhos</span>
          </CardTitle>
          <GoalManager />
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
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
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
                      R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Progress value={progressClamped} className="h-3 mb-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Faltam R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)}
                  </span>
                  {progress >= 100 && (
                    <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
                      Conquistado! 🎉
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTracker;