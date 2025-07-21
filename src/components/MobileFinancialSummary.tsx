import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDateContext } from "@/contexts/DateContext";
import { supabase } from "@/integrations/supabase/client";

const MobileFinancialSummary = () => {
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
        <CardContent className="p-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cálculos inteligentes
  const totalIncome = monthlyIncome + recurringIncome;
  const totalExpenses = monthlyExpenses + fixedExpenses;
  const monthlyBalance = totalIncome - totalExpenses;
  const variableBudget = totalIncome - fixedExpenses;
  const variableUsagePercentage = variableBudget > 0 ? (monthlyExpenses / variableBudget) * 100 : 100;

  return (
    <Card className="shadow-soft border-success/20 bg-success/5">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-center text-sm font-semibold text-success">
          📊 Resumo do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {/* Entradas e Saídas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-success/10 p-2 rounded-lg border border-success/20 text-center">
            <div className="text-lg">💰</div>
            <div className="text-sm font-medium text-success">Entrou</div>
            <div className="text-sm font-bold text-success">R$ {totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-destructive/10 p-2 rounded-lg border border-destructive/20 text-center">
            <div className="text-lg">💸</div>
            <div className="text-sm font-medium text-destructive">Saiu</div>
            <div className="text-sm font-bold text-destructive">R$ {totalExpenses.toFixed(2)}</div>
          </div>
        </div>

        {/* Saldo do mês */}
        <div className={`text-center p-3 rounded-lg border ${
          monthlyBalance >= 0 
            ? 'bg-success/10 border-success/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <div className="mb-1">
            <span className="text-xl">{monthlyBalance >= 0 ? '🎉' : '😰'}</span>
          </div>
          <span className={`text-lg font-bold block ${
            monthlyBalance >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            R$ {monthlyBalance.toFixed(2)}
          </span>
          <p className="text-xs text-muted-foreground">
            {monthlyBalance >= 0 ? 'Sobrou no final!' : 'Gastou mais que ganhou'}
          </p>
        </div>

        {/* Orçamento livre */}
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
          <div className="text-center mb-2">
            <h4 className="text-sm font-medium text-primary">🛒 Quanto ainda posso gastar?</h4>
          </div>
          
          <div className="text-center mb-2">
            <span className={`text-lg font-bold ${
              (variableBudget - monthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              R$ {Math.max(0, variableBudget - monthlyExpenses).toFixed(2)}
            </span>
          </div>
          
          <Progress 
            value={Math.min(variableUsagePercentage, 100)} 
            className="h-2 mb-2"
          />
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Usou <span className="font-semibold">{variableUsagePercentage.toFixed(0)}%</span> do orçamento
            </p>
          </div>
        </div>

        {/* Avisos importantes */}
        {variableUsagePercentage > 90 && (
          <div className="bg-warning/10 p-2 rounded-lg border border-warning/20">
            <div className="flex items-center space-x-2">
              <span className="text-sm">⚠️</span>
              <p className="text-xs text-warning font-medium">Cuidado! Quase no limite</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileFinancialSummary;