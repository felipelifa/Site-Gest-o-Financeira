import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'goal';
  date: string;
  emoji: string;
  category: string;
}

const SimpleFinancialCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const { data: fixedExpenses } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('next_due_date', startDate)
        .lte('next_due_date', endDate);

      // Buscar entradas recorrentes
      const { data: recurringIncomes } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .gte('next_receive_date', startDate)
        .lte('next_receive_date', endDate);

      // Buscar gastos variáveis
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Buscar entradas avulsas
      const { data: incomes } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('receive_date', startDate)
        .lte('receive_date', endDate);

      // Transformar dados para eventos do calendário
      const calendarEvents: CalendarEvent[] = [
        ...(fixedExpenses || []).map(expense => ({
          id: `fixed-${expense.id}`,
          title: expense.name,
          amount: expense.amount,
          type: 'expense' as const,
          date: expense.next_due_date,
          emoji: expense.emoji || '💳',
          category: expense.category
        })),
        ...(recurringIncomes || []).map(income => ({
          id: `income-${income.id}`,
          title: income.name,
          amount: income.amount,
          type: 'income' as const,
          date: income.next_receive_date,
          emoji: income.emoji || '💰',
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
        ...(incomes || []).map(income => ({
          id: `income-entry-${income.id}`,
          title: income.name,
          amount: income.amount,
          type: 'income' as const,
          date: income.receive_date,
          emoji: income.emoji || '💰',
          category: income.source_type === 'salary' ? 'Salário' :
                   income.source_type === 'freelance' ? 'Freelance' :
                   income.source_type === 'sales' ? 'Vendas' :
                   income.source_type === 'investment' ? 'Investimentos' :
                   income.source_type === 'gift' ? 'Presente' :
                   income.source_type === 'cashback' ? 'Cashback' :
                   income.source_type === 'rental' ? 'Aluguel' :
                   'Outros'
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
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDay(day);
      setShowDayDetails(true);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

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
    <>
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
                
                return (
                  <div
                    key={day}
                    className={`h-20 border rounded-lg p-1 transition-all hover:shadow-sm cursor-pointer ${
                      isToday(day) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/30'
                    } ${dayEvents.length > 0 ? 'hover:bg-accent/10' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isToday(day) ? 'text-primary' : 'text-foreground'
                      }`}>
                        {day}
                      </span>
                    </div>
                    
                    {/* Eventos do dia - apenas ícone e valor */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded flex items-center justify-between ${
                            event.type === 'income' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                          title={`${event.emoji} ${event.title} - R$ ${event.amount.toFixed(2)}`}
                        >
                          <span>{event.emoji}</span>
                          <span className="font-medium">R$ {event.amount.toFixed(0)}</span>
                        </div>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2}
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
                <p>Nenhum lançamento neste mês</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes do dia */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Lançamentos do dia {selectedDay}/{currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {selectedDay && getEventsForDay(selectedDay).map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{event.emoji}</span>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  event.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {event.type === 'income' ? '+' : '-'}R$ {event.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleFinancialCalendar;