import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDateContext } from "@/contexts/DateContext";
import { supabase } from "@/integrations/supabase/client";

const FinancialSummary = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [recurringIncome, setRecurringIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentDate, refreshTrigger } = useDateContext();

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user, currentDate, refreshTrigger]);

  const fetchFinancialData = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Buscar gastos variáveis do mês
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Buscar entradas do mês
      const { data: incomes } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('receive_date', startDate)
        .lte('receive_date', endDate);

      // Buscar renda recorrente ativa
      const { data: recurringIncomes } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      // Buscar gastos fixos
      const { data: fixedExpensesData } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user?.id);

      // Calcular totais
      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const totalIncomes = incomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const totalRecurringIncome = recurringIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const totalFixedExpenses = fixedExpensesData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      setMonthlyExpenses(totalExpenses);
      setMonthlyIncome(totalIncomes);
      setRecurringIncome(totalRecurringIncome);
      setFixedExpenses(totalFixedExpenses);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cálculos inteligentes
  const totalIncome = monthlyIncome + recurringIncome;
  const totalExpenses = monthlyExpenses + fixedExpenses;
  const monthlyBalance = totalIncome - totalExpenses;
  const variableBudget = totalIncome - fixedExpenses; // Quanto sobra após gastos fixos
  const variableUsagePercentage = variableBudget > 0 ? (monthlyExpenses / variableBudget) * 100 : 100;

  return (
    <Card className="shadow-soft">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">
          📊 Como Estão Suas Finanças
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Entenda de forma simples onde está seu dinheiro
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Simples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-success/10 rounded-xl border border-success/20">
            <div className="mb-3">
              <span className="text-3xl">💰</span>
            </div>
            <span className="text-2xl font-bold text-success block">R$ {totalIncome.toFixed(2)}</span>
            <p className="text-sm text-muted-foreground mt-1">Dinheiro que entrou</p>
          </div>

          <div className="text-center p-6 bg-destructive/10 rounded-xl border border-destructive/20">
            <div className="mb-3">
              <span className="text-3xl">💸</span>
            </div>
            <span className="text-2xl font-bold text-destructive block">R$ {totalExpenses.toFixed(2)}</span>
            <p className="text-sm text-muted-foreground mt-1">Dinheiro que saiu</p>
          </div>

          <div className={`text-center p-6 rounded-xl border ${
            monthlyBalance >= 0 
              ? 'bg-success/10 border-success/20' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <div className="mb-3">
              <span className="text-3xl">{monthlyBalance >= 0 ? '🎉' : '😰'}</span>
            </div>
            <span className={`text-2xl font-bold block ${
              monthlyBalance >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              R$ {monthlyBalance.toFixed(2)}
            </span>
            <p className={`text-sm mt-1 ${monthlyBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {monthlyBalance >= 0 ? 'Sobrou no final! 🎊' : 'Gastou mais que ganhou ⚠️'}
            </p>
          </div>
        </div>

        {/* Quanto Ainda Pode Gastar */}
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-primary">🛒 Quanto ainda posso gastar?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Depois de descontar os gastos fixos (aluguel, contas, etc.)
            </p>
          </div>
          
          <div className="text-center mb-4">
            <span className={`text-3xl font-bold ${
              (variableBudget - monthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              R$ {Math.max(0, variableBudget - monthlyExpenses).toFixed(2)}
            </span>
            <p className="text-sm text-muted-foreground mt-1">Disponível para gastos</p>
          </div>
          
          <Progress 
            value={Math.min(variableUsagePercentage, 100)} 
            className="h-4 mb-3"
          />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Você já usou <span className="font-semibold">{variableUsagePercentage.toFixed(0)}%</span> do seu orçamento livre
            </p>
          </div>
        </div>

        {/* Dicas Personalizadas */}
        <div className="bg-warning/10 p-6 rounded-xl border border-warning/20">
          <h4 className="text-lg font-semibold text-warning mb-3">💡 Dicas para você</h4>
          <div className="space-y-3">
            {variableUsagePercentage > 90 && (
              <div className="flex items-start space-x-3 p-3 bg-warning/10 rounded-lg">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium text-warning">Cuidado com os gastos!</p>
                  <p className="text-sm text-muted-foreground">Você já gastou quase tudo que podia este mês</p>
                </div>
              </div>
            )}
            {monthlyBalance > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-success/10 rounded-lg">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="font-medium text-success">Muito bem!</p>
                  <p className="text-sm text-muted-foreground">Você conseguiu sobrar dinheiro este mês</p>
                </div>
              </div>
            )}
            {fixedExpenses > totalIncome * 0.5 && (
              <div className="flex items-start space-x-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-medium text-destructive">Gastos fixos altos</p>
                  <p className="text-sm text-muted-foreground">Mais da metade da sua renda vai para gastos fixos</p>
                </div>
              </div>
            )}
            {monthlyBalance < 0 && (
              <div className="flex items-start space-x-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-xl">📉</span>
                <div>
                  <p className="font-medium text-destructive">Gastou demais</p>
                  <p className="text-sm text-muted-foreground">Este mês saiu mais dinheiro do que entrou</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;