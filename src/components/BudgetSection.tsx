import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import FinancialCalendar from "./FinancialCalendar";
import PremiumGuard from "./PremiumGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useDateContext } from "@/contexts/DateContext";
import { supabase } from "@/integrations/supabase/client";

interface BudgetSectionProps {
  totalSpent: number;
  budget: number;
  onBudgetUpdate: (budget: number) => void;
  onTotalSpentUpdate?: (totalSpent: number) => void;
}

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  next_due_date: string;
  is_paid: boolean;
  category: string;
}

interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  next_receive_date: string;
  frequency: string;
}

const BudgetSection = ({ totalSpent, budget, onBudgetUpdate, onTotalSpentUpdate }: BudgetSectionProps) => {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>([]);
  const [monthlyIncomes, setMonthlyIncomes] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);
  const [totalRecurringIncome, setTotalRecurringIncome] = useState(0);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const { user } = useAuth();
  const { currentDate, refreshTrigger } = useDateContext();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user, currentDate, refreshTrigger]);


  const loadFinancialData = async () => {
    if (!user) return;

    try {
      // Carregar gastos fixos que devem aparecer no mês atual
      const { data: expensesData } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id);

      if (expensesData) {
        setFixedExpenses(expensesData);
        // Filtrar gastos fixos que devem aparecer no mês atual baseado no due_date
        const fixedForMonth = expensesData.filter(expense => {
          const dueDay = expense.due_date;
          return dueDay >= 1 && dueDay <= 31; // Validar se é um dia válido
        });
        const total = fixedForMonth.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setTotalFixedExpenses(total);
      }

      // Carregar entradas recorrentes que devem aparecer no mês atual
      const { data: incomeData } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (incomeData) {
        setRecurringIncomes(incomeData);
        // Filtrar entradas que devem aparecer no mês atual baseado no receive_date
        const currentMonth = currentDate.getMonth() + 1;
        const recurringForMonth = incomeData.filter(income => {
          const receiveDay = income.receive_date;
          return receiveDay >= 1 && receiveDay <= 31; // Validar se é um dia válido
        });
        const total = recurringForMonth.reduce((sum, income) => sum + Number(income.amount), 0);
        setTotalRecurringIncome(total);
      }

      // Carregar entradas do mês específico
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      const { data: monthlyIncomeData } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('receive_date', startOfMonth.toISOString().split('T')[0])
        .lte('receive_date', endOfMonth.toISOString().split('T')[0]);

      if (monthlyIncomeData) {
        setMonthlyIncomes(monthlyIncomeData);
        const totalIncome = monthlyIncomeData.reduce((sum, income) => sum + Number(income.amount), 0);
        setTotalMonthlyIncome(totalIncome);
      }

      // Carregar gastos do mês específico
      const { data: monthlyExpenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (monthlyExpenseData) {
        const totalExpenses = monthlyExpenseData.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setMonthlyExpenses(totalExpenses);
        
        // Atualizar o totalSpent do Dashboard
        if (onTotalSpentUpdate) {
          onTotalSpentUpdate(totalExpenses);
        }
      }

      // Definir o orçamento como o total de entradas do mês (renda recorrente + entradas mensais)
      const totalMonthlyBudget = totalRecurringIncome + (monthlyIncomeData?.reduce((sum, income) => sum + Number(income.amount), 0) || 0);
      onBudgetUpdate(totalMonthlyBudget);
      
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const totalAvailableIncome = totalRecurringIncome + totalMonthlyIncome;
  const totalSpentWithFixed = monthlyExpenses + totalFixedExpenses; // Total gasto (gastos rápidos + fixos)
  const budgetBalance = totalAvailableIncome - totalSpentWithFixed; // Balanço real
  const monthlyBalance = totalAvailableIncome - totalFixedExpenses;

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orçamento Livre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${budgetBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {budgetBalance.toFixed(2)}
              </span>
              {budgetBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Após gastos fixos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos Fixos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-orange-600">
                R$ {totalFixedExpenses.toFixed(2)}
              </span>
              <Calculator className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Debitados este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Renda Recorrente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-success">
                R$ {totalRecurringIncome.toFixed(2)}
              </span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-success">
                R$ {totalMonthlyIncome.toFixed(2)}
              </span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recebido este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balanço Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {monthlyBalance.toFixed(2)}
              </span>
              {monthlyBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renda total - Gastos fixos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gestão Financeira */}
      <PremiumGuard feature="calendário financeiro avançado">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span>Gestão Financeira</span>
              </CardTitle>
              
              <Badge variant="outline">Gestão Financeira</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FinancialCalendar />
          </CardContent>
        </Card>
      </PremiumGuard>
    </div>
  );
};

export default BudgetSection;