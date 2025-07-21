import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, TrendingUp, DollarSign, Calendar, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  receive_date: number;
  next_receive_date: string;
  emoji: string;
  notes?: string;
  is_active: boolean;
}

const RecurringIncomeManager = () => {
  const [incomes, setIncomes] = useState<RecurringIncome[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<RecurringIncome | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    receive_date: '',
    emoji: '💰',
    notes: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const frequencies = [
    { value: 'weekly', label: 'Semanal', emoji: '📅' },
    { value: 'biweekly', label: 'Quinzenal', emoji: '📆' },
    { value: 'monthly', label: 'Mensal', emoji: '🗓️' },
    { value: 'yearly', label: 'Anual', emoji: '📊' },
  ];

  const incomeTypes = [
    { value: 'Salário', emoji: '💼' },
    { value: 'Freelance', emoji: '💻' },
    { value: 'Aposentadoria', emoji: '👴' },
    { value: 'Investimentos', emoji: '📈' },
    { value: 'Aluguel', emoji: '🏠' },
    { value: 'Pensão', emoji: '💳' },
    { value: 'Outros', emoji: '💰' },
  ];

  useEffect(() => {
    if (user) {
      fetchRecurringIncomes();
    }
  }, [user]);

  const fetchRecurringIncomes = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user?.id)
        .order('next_receive_date');

      if (error) throw error;
      setIncomes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar entradas recorrentes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextReceiveDate = (receiveDay: number, frequency: string) => {
    const today = new Date();
    let nextDate: Date;

    switch (frequency) {
      case 'weekly':
        // Para semanal, receiveDay representa o dia da semana (0-6)
        nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (receiveDay - today.getDay() + 7) % 7);
        if (nextDate <= today) {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
      
      case 'biweekly':
        // Para quinzenal, usar o dia do mês
        nextDate = new Date(today.getFullYear(), today.getMonth(), receiveDay);
        if (nextDate <= today) {
          nextDate.setDate(receiveDay + 15);
          if (nextDate.getMonth() !== today.getMonth()) {
            nextDate = new Date(today.getFullYear(), today.getMonth() + 1, receiveDay);
          }
        }
        break;
      
      case 'monthly':
        nextDate = new Date(today.getFullYear(), today.getMonth(), receiveDay);
        if (nextDate <= today) {
          nextDate = new Date(today.getFullYear(), today.getMonth() + 1, receiveDay);
        }
        break;
      
      case 'yearly':
        nextDate = new Date(today.getFullYear(), today.getMonth(), receiveDay);
        if (nextDate <= today) {
          nextDate = new Date(today.getFullYear() + 1, today.getMonth(), receiveDay);
        }
        break;
      
      default:
        nextDate = new Date(today.getFullYear(), today.getMonth(), receiveDay);
    }

    return nextDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.receive_date) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextReceiveDate = calculateNextReceiveDate(
        parseInt(formData.receive_date), 
        formData.frequency
      );

      const incomeData = {
        user_id: user?.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        receive_date: parseInt(formData.receive_date),
        next_receive_date: nextReceiveDate,
        emoji: formData.emoji,
        notes: formData.notes,
        is_active: formData.is_active
      };

      if (editingIncome) {
        const { error } = await supabase
          .from('recurring_income')
          .update(incomeData)
          .eq('id', editingIncome.id);

        if (error) throw error;

        toast({
          title: "Entrada recorrente atualizada! ✨",
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        const { error } = await supabase
          .from('recurring_income')
          .insert([incomeData]);

        if (error) throw error;

        toast({
          title: "Entrada recorrente adicionada! 🎉",
          description: `${formData.name} - R$ ${formData.amount}`,
        });
      }

      setFormData({
        name: '',
        amount: '',
        frequency: 'monthly',
        receive_date: '',
        emoji: '💰',
        notes: '',
        is_active: true
      });
      setEditingIncome(null);
      setIsOpen(false);
      fetchRecurringIncomes();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar entrada recorrente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (income: RecurringIncome) => {
    try {
      const { error } = await supabase
        .from('recurring_income')
        .update({ is_active: !income.is_active })
        .eq('id', income.id);

      if (error) throw error;

      toast({
        title: income.is_active ? "Entrada desativada" : "Entrada ativada",
        description: `${income.name} foi ${income.is_active ? 'desativada' : 'ativada'}`,
      });

      fetchRecurringIncomes();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (income: RecurringIncome) => {
    try {
      const { error } = await supabase
        .from('recurring_income')
        .delete()
        .eq('id', income.id);

      if (error) throw error;

      toast({
        title: "Entrada recorrente removida",
        description: `${income.name} foi removida`,
      });

      fetchRecurringIncomes();
    } catch (error: any) {
      toast({
        title: "Erro ao remover entrada",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (income: RecurringIncome) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount.toString(),
      frequency: income.frequency,
      receive_date: income.receive_date.toString(),
      emoji: income.emoji,
      notes: income.notes || '',
      is_active: income.is_active
    });
    setIsOpen(true);
  };

  const getDaysUntilReceive = (receiveDate: string) => {
    const today = new Date();
    const receive = new Date(receiveDate);
    const diffTime = receive.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFrequencyLabel = (frequency: string) => {
    return frequencies.find(f => f.value === frequency)?.label || frequency;
  };

  const getTotalMonthlyIncome = () => {
    return incomes
      .filter(income => income.is_active)
      .reduce((total, income) => {
        // Converte todas as frequências para valor mensal estimado
        let monthlyAmount = income.amount;
        switch (income.frequency) {
          case 'weekly':
            monthlyAmount = income.amount * 4.33; // 4.33 semanas por mês
            break;
          case 'biweekly':
            monthlyAmount = income.amount * 2;
            break;
          case 'yearly':
            monthlyAmount = income.amount / 12;
            break;
          // monthly mantém o valor original
        }
        return total + monthlyAmount;
      }, 0);
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <span>Entradas Recorrentes</span>
          </CardTitle>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-success hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? 'Editar Entrada Recorrente' : 'Nova Entrada Recorrente'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Select
                    value={formData.name}
                    onValueChange={(value) => {
                      const incomeType = incomeTypes.find(t => t.value === value);
                      setFormData({ 
                        ...formData, 
                        name: value,
                        emoji: incomeType?.emoji || '💰'
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de entrada" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    max={formData.frequency === 'weekly' ? '7' : '31'}
                    placeholder={formData.frequency === 'weekly' ? 'Dia sem.' : 'Dia'}
                    value={formData.receive_date}
                    onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
                    className="w-20"
                    required
                  />
                </div>
                
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.emoji} {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Observações (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">Entrada ativa</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setEditingIncome(null);
                      setFormData({
                        name: '',
                        amount: '',
                        frequency: 'monthly',
                        receive_date: '',
                        emoji: '💰',
                        notes: '',
                        is_active: true
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
                    {editingIncome ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {incomes.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Total mensal estimado: <strong className="text-green-600">R$ {getTotalMonthlyIncome().toFixed(2)}</strong></span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {incomes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma entrada recorrente cadastrada</p>
            <p className="text-sm">Adicione suas fontes de renda para melhor planejamento</p>
          </div>
        ) : (
          incomes.map((income) => {
            const daysUntilReceive = getDaysUntilReceive(income.next_receive_date);
            const isToday = daysUntilReceive === 0;
            const isSoon = daysUntilReceive <= 7 && daysUntilReceive > 0;
            
            return (
              <div
                key={income.id}
                className={`p-4 rounded-lg border transition-all ${
                  !income.is_active 
                    ? 'border-muted bg-muted/30 opacity-60' 
                    : isToday 
                      ? 'border-green-200 bg-green-50'
                      : isSoon 
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-muted bg-background'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{income.emoji}</span>
                    <div>
                      <h4 className="font-medium flex items-center space-x-2">
                        <span>{income.name}</span>
                        {!income.is_active && (
                          <Badge variant="secondary" className="text-xs">Inativo</Badge>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>R$ {income.amount.toFixed(2)}</span>
                        <span>•</span>
                        <span>{getFrequencyLabel(income.frequency)}</span>
                        <span>•</span>
                        <span>Dia {income.receive_date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {income.is_active && (
                      <Badge variant={isToday ? "default" : isSoon ? "secondary" : "outline"}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {isToday 
                          ? 'Hoje!'
                          : daysUntilReceive < 0 
                            ? `${Math.abs(daysUntilReceive)} dias atrás`
                            : `${daysUntilReceive} dias`
                        }
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(income)}
                      className={income.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                    >
                      {income.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(income)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(income)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {income.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{income.notes}</p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecurringIncomeManager;