import React, { useState, useEffect } from "react";
import Header from "./Header";
import SummaryCards from "./SummaryCards";
import FinancialSummary from "./FinancialSummary";
import MobileFinancialSummary from "./MobileFinancialSummary";
import TransactionHistory from "./TransactionHistory";
import QuickTransactionForm from "./QuickTransactionForm";
import TrialBanner from "./TrialBanner";
import SmartUpsell from "./SmartUpsell";
import AchievementSystem from "./AchievementSystem";
import { useAuth } from "@/contexts/AuthContext";
import { DateProvider, useDateContext } from "@/contexts/DateContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  emoji: string;
}

const DashboardContent = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [userBehavior, setUserBehavior] = useState({
    daysActive: 0,
    featuresUsed: [] as string[],
    goalsCreated: 0,
    expensesLogged: 0
  });
  const { user } = useAuth();
  const { triggerRefresh } = useDateContext();
  const { toast } = useToast();

  // Carregar dados do usuário para comportamento
  useEffect(() => {
    if (user) {
      loadUserBehavior();
    }
  }, [user]);

  const loadUserBehavior = async () => {
    if (!user) return;

    try {
      // Contar gastos
      const { count: expenseCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Contar metas
      const { count: goalCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calcular dias ativos (simulado)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      const daysActive = profile?.created_at 
        ? Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 1;

      setUserBehavior({
        daysActive,
        featuresUsed: ['expenses', 'goals'],
        goalsCreated: goalCount || 0,
        expensesLogged: expenseCount || 0
      });
    } catch (error) {
      console.error('Error loading user behavior:', error);
    }
  };

  const addExpense = async (newExpense: { amount: number; description: string; category: string }) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const expenseData = {
        user_id: user.id,
        amount: newExpense.amount,
        description: newExpense.description,
        category: newExpense.category,
        emoji: getCategoryEmoji(newExpense.category),
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        expense_type: 'normal'
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) throw error;

      // Atualizar estado local também
      const expense: Expense = {
        id: data[0].id,
        ...newExpense,
        date: expenseData.date,
        emoji: getCategoryEmoji(newExpense.category)
      };
      setExpenses([expense, ...expenses]);

      toast({
        title: "Gasto salvo! 🎉",
        description: `R$ ${newExpense.amount.toFixed(2)} adicionado com sucesso`,
      });

      // Atualizar o contexto para todos os componentes
      triggerRefresh();
    } catch (error: any) {
      console.error('Erro ao salvar gasto:', error);
      toast({
        title: "Erro ao salvar gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Lazer': '🎬',
      'Saúde': '💊',
      'Casa': '🏠',
      'Compras': '🛍️',
      'Outros': '💰'
    };
    return emojis[category] || emojis['Outros'];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full px-2 md:px-4 lg:px-6 py-3 md:py-4 max-w-7xl mx-auto space-y-3 md:space-y-4">
        {/* Banner de Trial - apenas no desktop */}
        <div className="hidden md:block">
          <TrialBanner />
        </div>
        
        {/* Cards de resumo compactos */}
        <SummaryCards />

        {/* Formulário de movimentações compacto */}
        <QuickTransactionForm />
        
        {/* Resumo financeiro mais simples em mobile */}
        <div className="md:hidden">
          <MobileFinancialSummary />
        </div>
        
        {/* Conteúdo adicional apenas no desktop */}
        <div className="hidden md:block space-y-4">
          <FinancialSummary />
          <SmartUpsell userBehavior={userBehavior} />
          <AchievementSystem />
        </div>
        
        {/* Histórico sempre visível */}
        <TransactionHistory />
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <DateProvider>
      <DashboardContent />
    </DateProvider>
  );
};

export default Dashboard;