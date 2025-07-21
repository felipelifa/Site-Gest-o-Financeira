import React, { useState, useEffect } from "react";
import LocalHeader from "./LocalHeader";
import SummaryCards from "./SummaryCards";
import FinancialSummary from "./FinancialSummary";
import MobileFinancialSummary from "./MobileFinancialSummary";
import TransactionHistory from "./TransactionHistory";
import QuickTransactionForm from "./QuickTransactionForm";
import AchievementSystem from "./AchievementSystem";
import { useLocalData } from "@/contexts/LocalDataContext";
import { DateProvider, useDateContext } from "@/contexts/DateContext";
import { useToast } from "@/hooks/use-toast";

const LocalDashboardContent = () => {
  const [userBehavior, setUserBehavior] = useState({
    daysActive: 1,
    featuresUsed: [] as string[],
    goalsCreated: 0,
    expensesLogged: 0
  });
  
  const { expenses, goals, addExpense } = useLocalData();
  const { triggerRefresh } = useDateContext();
  const { toast } = useToast();

  // Calcular dados do usuário para comportamento
  useEffect(() => {
    const daysActive = 1; // Simulado para app local
    const featuresUsed = ['expenses'];
    if (goals.length > 0) featuresUsed.push('goals');
    
    setUserBehavior({
      daysActive,
      featuresUsed,
      goalsCreated: goals.length,
      expensesLogged: expenses.length
    });
  }, [expenses.length, goals.length]);

  const handleAddExpense = async (newExpense: { amount: number; description: string; category: string }) => {
    try {
      const expenseData = {
        ...newExpense,
        emoji: getCategoryEmoji(newExpense.category),
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        expense_type: 'normal'
      };

      addExpense(expenseData);

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
        description: error.message || "Erro desconhecido",
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
      <LocalHeader />
      
      <main className="w-full px-2 md:px-4 lg:px-6 py-3 md:py-4 max-w-7xl mx-auto space-y-3 md:space-y-4">
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
          <AchievementSystem />
        </div>
        
        {/* Histórico sempre visível */}
        <TransactionHistory />
      </main>
    </div>
  );
};

const LocalDashboard = () => {
  return (
    <DateProvider>
      <LocalDashboardContent />
    </DateProvider>
  );
};

export default LocalDashboard;