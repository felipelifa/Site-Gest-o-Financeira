import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Target, Sparkles } from "lucide-react";
import BudgetManager from "./BudgetManager";

interface WeeklyStatsProps {
  totalSpent: number;
  budget: number;
  topCategory: string;
  onBudgetUpdate?: (budget: number) => void;
}

const WeeklyStats = ({ totalSpent, budget, topCategory, onBudgetUpdate }: WeeklyStatsProps) => {
  const spentPercentage = (totalSpent / budget) * 100;
  const isOverBudget = spentPercentage > 100;
  const savings = Math.max(0, budget - totalSpent);
  
  const motivationalMessage = () => {
    if (spentPercentage <= 70) return "Parabéns! Você está mandando bem! 🎉";
    if (spentPercentage <= 90) return "Boa! Quase lá, continue assim! 💪";
    if (spentPercentage <= 100) return "Atenção! Falta pouco para o limite 👀";
    return "Ops! Passou do orçamento, mas não desista! 🚀";
  };

  const getProgressColor = () => {
    if (spentPercentage <= 70) return "bg-success";
    if (spentPercentage <= 90) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gasto da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</span>
            {isOverBudget ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-success" />
            )}
          </div>
          <div className="mt-2">
            <Progress 
              value={Math.min(spentPercentage, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {spentPercentage.toFixed(1)}% do orçamento
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">R$ {budget.toFixed(2)}</span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <BudgetManager onBudgetUpdate={onBudgetUpdate} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Restam R$ {Math.max(0, budget - totalSpent).toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Economia do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-success">R$ {savings.toFixed(2)}</span>
            <Sparkles className="h-4 w-4 text-success" />
          </div>
          <p className="text-xs text-success mt-1">
            Continue assim! 🎯
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Categoria Top
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">{topCategory}</span>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Onde você mais gastou
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4 bg-gradient-fun border-none">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎉</div>
            <div>
              <h3 className="font-bold text-white text-lg">{motivationalMessage()}</h3>
              <p className="text-white/80 text-sm">
                Cada anotação é um passo rumo aos seus sonhos!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyStats;