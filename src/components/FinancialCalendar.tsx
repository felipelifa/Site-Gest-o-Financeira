import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDateContext } from '@/contexts/DateContext';
import { supabase } from '@/integrations/supabase/client';
import AddTransactionDialog from './AddTransactionDialog';

interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  emoji: string;
  category: string;
}

const FinancialCalendar = () => {
  const { currentDate, setCurrentDate, triggerRefresh } = useDateContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCalendarEvents();
    }
  }, [user, currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Buscar gastos fixos
      const { data: fixedExpenses, error: fixedError } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('next_due_date', startDate)
        .lte('next_due_date', endDate);

      if (fixedError) throw fixedError;

      // Buscar entradas recorrentes
      const { data: recurringIncomes, error: incomeError } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .gte('next_receive_date', startDate)
        .lte('next_receive_date', endDate);

      if (incomeError) throw incomeError;

      // Buscar gastos variáveis do mês
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (expenseError) throw expenseError;

      // Buscar entradas do mês
      const { data: incomeEntries, error: incomeEntriesError } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('receive_date', startDate)
        .lte('receive_date', endDate);

      if (incomeEntriesError) throw incomeEntriesError;

      // Transformar dados para eventos do calendário
      const calendarEvents: CalendarEvent[] = [
        ...(fixedExpenses || []).map(expense => ({
          id: `fixed-${expense.id}`,
          title: expense.name,
          amount: expense.amount,
          type: 'expense' as const,
          date: expense.next_due_date,
          emoji: expense.emoji,
          category: expense.category
        })),
        ...(recurringIncomes || []).map(income => ({
          id: `income-${income.id}`,
          title: income.name,
          amount: income.amount,
          type: 'income' as const,
          date: income.next_receive_date,
          emoji: income.emoji,
          category: income.name
        })),
        ...(expenses || []).map(expense => ({
          id: `expense-${expense.id}`,
          title: expense.description,
          amount: expense.amount,
          type: 'expense' as const,
          date: expense.date,
          emoji: expense.emoji || '💸',
          category: expense.category
        })),
        ...(incomeEntries || []).map(income => ({
          id: `income-entry-${income.id}`,
          title: income.name,
          amount: income.amount,
          type: 'income' as const,
          date: income.receive_date,
          emoji: income.emoji || '💰',
          category: income.notes || 'Entrada'
        }))
      ];

      setEvents(calendarEvents);
    } catch (error: any) {
      console.error('Erro ao carregar eventos do calendário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    
    return events.filter(event => event.date === targetDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getMonthTotals = () => {
    const totalIncome = events
      .filter(event => event.type === 'income')
      .reduce((sum, event) => sum + event.amount, 0);
    
    const totalExpenses = events
      .filter(event => event.type === 'expense')
      .reduce((sum, event) => sum + event.amount, 0);

    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    setSelectedDate(selectedDate);
    setIsDialogOpen(true);
  };

  const handleTransactionAdded = () => {
    fetchCalendarEvents();
    triggerRefresh(); // Notifica outros componentes para atualizar
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthTotals = getMonthTotals();

  if (loading) {
    return (
      <Card className="shadow-magical border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-magical border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Calendar className="h-5 w-5" />
            <span>Calendário Financeiro</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {events.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>Entradas: R$ {monthTotals.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span>Saídas: R$ {monthTotals.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className={monthTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                Saldo: R$ {monthTotals.balance.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {/* Células vazias para o início do mês */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 border rounded-lg"></div>
            ))}
            
            {/* Dias do mês */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const hasIncome = dayEvents.some(event => event.type === 'income');
              const hasExpense = dayEvents.some(event => event.type === 'expense');
              
              return (
                <div
                  key={day}
                  className={`h-20 border rounded-lg p-1 transition-all hover:shadow-sm cursor-pointer group ${
                    isToday(day) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/30'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isToday(day) ? 'text-primary' : 'text-foreground'
                    }`}>
                      {day}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      {dayEvents.length > 0 && (
                        <>
                          {hasIncome && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                          {hasExpense && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </>
                      )}
                      <Plus className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${
                          event.type === 'income' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        title={`${event.emoji} ${event.title} - R$ ${event.amount.toFixed(2)}`}
                      >
                        <span className="mr-1">{event.emoji}</span>
                        <span className="truncate">R$ {event.amount.toFixed(0)}</span>
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento financeiro neste mês</p>
              <p className="text-sm">Adicione gastos fixos e entradas recorrentes para visualizar no calendário</p>
            </div>
          )}
        </div>
      </CardContent>

      <AddTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedDate={selectedDate}
        onTransactionAdded={handleTransactionAdded}
      />
    </Card>
  );
};

export default FinancialCalendar;