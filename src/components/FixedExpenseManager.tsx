import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: number;
  recurrence: string;
  is_paid: boolean;
  next_due_date: string;
  emoji: string;
  notes?: string;
}

const FixedExpenseManager = () => {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    due_date: '',
    recurrence: 'monthly',
    emoji: '💳',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    { value: 'Moradia', emoji: '🏠' },
    { value: 'Transporte', emoji: '🚗' },
    { value: 'Saúde', emoji: '🏥' },
    { value: 'Educação', emoji: '📚' },
    { value: 'Seguros', emoji: '🛡️' },
    { value: 'Serviços', emoji: '🔧' },
    { value: 'Financiamento', emoji: '🏦' },
    { value: 'Outros', emoji: '💳' },
  ];

  useEffect(() => {
    if (user) {
      fetchFixedExpenses();
    }
  }, [user]);

  const fetchFixedExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('next_due_date');

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar gastos fixos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDueDate = (dueDay: number, recurrence: string) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextDate = new Date(currentYear, currentMonth, dueDay);
    
    if (nextDate <= today) {
      if (recurrence === 'monthly') {
        nextDate = new Date(currentYear, currentMonth + 1, dueDay);
      } else if (recurrence === 'yearly') {
        nextDate = new Date(currentYear + 1, currentMonth, dueDay);
      }
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.category || !formData.due_date) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextDueDate = calculateNextDueDate(
        parseInt(formData.due_date), 
        formData.recurrence
      );

      const expenseData = {
        user_id: user?.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        due_date: parseInt(formData.due_date),
        recurrence: formData.recurrence,
        emoji: formData.emoji,
        notes: formData.notes,
        next_due_date: nextDueDate,
        is_paid: false
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('fixed_expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;

        toast({
          title: "Gasto fixo atualizado! ✨",
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        const { error } = await supabase
          .from('fixed_expenses')
          .insert([expenseData]);

        if (error) throw error;

        toast({
          title: "Gasto fixo adicionado! 🎉",
          description: `${formData.name} - R$ ${formData.amount}`,
        });
      }

      setFormData({
        name: '',
        amount: '',
        category: '',
        due_date: '',
        recurrence: 'monthly',
        emoji: '💳',
        notes: ''
      });
      setEditingExpense(null);
      setIsOpen(false);
      fetchFixedExpenses();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar gasto fixo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (expense: FixedExpense) => {
    try {
      const nextDueDate = calculateNextDueDate(expense.due_date, expense.recurrence);
      
      const { error } = await supabase
        .from('fixed_expenses')
        .update({
          is_paid: true,
          last_paid_date: new Date().toISOString().split('T')[0],
          next_due_date: nextDueDate
        })
        .eq('id', expense.id);

      if (error) throw error;

      toast({
        title: "Gasto marcado como pago! ✅",
        description: `${expense.name} foi marcado como pago`,
      });

      fetchFixedExpenses();
    } catch (error: any) {
      toast({
        title: "Erro ao marcar como pago",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (expense: FixedExpense) => {
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('id', expense.id);

      if (error) throw error;

      toast({
        title: "Gasto fixo removido",
        description: `${expense.name} foi removido`,
      });

      fetchFixedExpenses();
    } catch (error: any) {
      toast({
        title: "Erro ao remover gasto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      due_date: expense.due_date.toString(),
      recurrence: expense.recurrence,
      emoji: expense.emoji,
      notes: expense.notes || ''
    });
    setIsOpen(true);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card className="shadow-magical border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-magical border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Calendar className="h-5 w-5" />
          <span>Gastos Fixos</span>
        </CardTitle>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-success hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome do gasto (ex: Aluguel)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="flex-1"
                  required
                />
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Dia"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-20"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    const category = categories.find(c => c.value === value);
                    setFormData({ 
                      ...formData, 
                      category: value,
                      emoji: category?.emoji || '💳'
                    });
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.recurrence}
                  onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Observações (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingExpense(null);
                    setFormData({
                      name: '',
                      amount: '',
                      category: '',
                      due_date: '',
                      recurrence: 'monthly',
                      emoji: '💳',
                      notes: ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-success hover:opacity-90"
                >
                  {editingExpense ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum gasto fixo cadastrado</p>
            <p className="text-sm">Adicione seus gastos mensais para melhor controle</p>
          </div>
        ) : (
          expenses.map((expense) => {
            const daysUntilDue = getDaysUntilDue(expense.next_due_date);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
            
            return (
              <div
                key={expense.id}
                className={`p-4 rounded-lg border transition-all ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : isDueSoon 
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-muted bg-background'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{expense.emoji}</span>
                    <div>
                      <h4 className="font-medium">{expense.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>R$ {expense.amount.toFixed(2)}</span>
                        <span>•</span>
                        <span>Dia {expense.due_date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {expense.is_paid ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pago
                      </Badge>
                    ) : (
                      <>
                        <Badge variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "secondary"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {isOverdue 
                            ? `${Math.abs(daysUntilDue)} dias atraso`
                            : daysUntilDue === 0 
                              ? 'Vence hoje!'
                              : `${daysUntilDue} dias`
                          }
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(expense)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {expense.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{expense.notes}</p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default FixedExpenseManager;