import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  emoji: string;
  expense_type: string;
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  emoji: string;
  created_at: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: number;
  recurrence: string;
  emoji: string;
  notes?: string;
  is_paid: boolean;
  next_due_date: string;
  last_paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  receive_date: number;
  emoji: string;
  notes?: string;
  is_active: boolean;
  next_receive_date: string;
  source_type: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudget {
  id: string;
  month: number;
  year: number;
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  full_name: string;
  main_dream?: string;
  onboarding_completed: boolean;
  dream_steps: number;
  last_activity_streak: number;
}

interface LocalDataContextType {
  // Profile
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Fixed Expenses
  fixedExpenses: FixedExpense[];
  addFixedExpense: (expense: Omit<FixedExpense, 'id' | 'created_at' | 'updated_at'>) => void;
  updateFixedExpense: (id: string, data: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  
  // Recurring Income
  recurringIncomes: RecurringIncome[];
  addRecurringIncome: (income: Omit<RecurringIncome, 'id' | 'created_at' | 'updated_at'>) => void;
  updateRecurringIncome: (id: string, data: Partial<RecurringIncome>) => void;
  deleteRecurringIncome: (id: string) => void;
  
  // Monthly Budgets
  monthlyBudgets: MonthlyBudget[];
  addMonthlyBudget: (budget: Omit<MonthlyBudget, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMonthlyBudget: (id: string, data: Partial<MonthlyBudget>) => void;
  deleteMonthlyBudget: (id: string) => void;
}

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const LocalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useLocalStorage<UserProfile>('dindin_profile', {
    full_name: 'Usuário',
    onboarding_completed: false,
    dream_steps: 0,
    last_activity_streak: 0,
  });

  const [expenses, setExpenses] = useLocalStorage<Expense[]>('dindin_expenses', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('dindin_goals', []);
  const [fixedExpenses, setFixedExpenses] = useLocalStorage<FixedExpense[]>('dindin_fixed_expenses', []);
  const [recurringIncomes, setRecurringIncomes] = useLocalStorage<RecurringIncome[]>('dindin_recurring_incomes', []);
  const [monthlyBudgets, setMonthlyBudgets] = useLocalStorage<MonthlyBudget[]>('dindin_monthly_budgets', []);

  // Helper function to generate IDs
  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Profile methods
  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  // Expense methods
  const addExpense = (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...data } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Goal methods
  const addGoal = (goal: Omit<Goal, 'id' | 'created_at'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (id: string, data: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...data } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  // Fixed Expense methods
  const addFixedExpense = (expense: Omit<FixedExpense, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newExpense: FixedExpense = {
      ...expense,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    setFixedExpenses(prev => [newExpense, ...prev]);
  };

  const updateFixedExpense = (id: string, data: Partial<FixedExpense>) => {
    setFixedExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...data, updated_at: new Date().toISOString() } : expense
    ));
  };

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Recurring Income methods
  const addRecurringIncome = (income: Omit<RecurringIncome, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newIncome: RecurringIncome = {
      ...income,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    setRecurringIncomes(prev => [newIncome, ...prev]);
  };

  const updateRecurringIncome = (id: string, data: Partial<RecurringIncome>) => {
    setRecurringIncomes(prev => prev.map(income => 
      income.id === id ? { ...income, ...data, updated_at: new Date().toISOString() } : income
    ));
  };

  const deleteRecurringIncome = (id: string) => {
    setRecurringIncomes(prev => prev.filter(income => income.id !== id));
  };

  // Monthly Budget methods
  const addMonthlyBudget = (budget: Omit<MonthlyBudget, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newBudget: MonthlyBudget = {
      ...budget,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    setMonthlyBudgets(prev => [newBudget, ...prev]);
  };

  const updateMonthlyBudget = (id: string, data: Partial<MonthlyBudget>) => {
    setMonthlyBudgets(prev => prev.map(budget => 
      budget.id === id ? { ...budget, ...data, updated_at: new Date().toISOString() } : budget
    ));
  };

  const deleteMonthlyBudget = (id: string) => {
    setMonthlyBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const value = {
    profile,
    updateProfile,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    fixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    recurringIncomes,
    addRecurringIncome,
    updateRecurringIncome,
    deleteRecurringIncome,
    monthlyBudgets,
    addMonthlyBudget,
    updateMonthlyBudget,
    deleteMonthlyBudget,
  };

  return (
    <LocalDataContext.Provider value={value}>
      {children}
    </LocalDataContext.Provider>
  );
};

export const useLocalData = () => {
  const context = useContext(LocalDataContext);
  if (context === undefined) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
};