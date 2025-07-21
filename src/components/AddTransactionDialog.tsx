import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onTransactionAdded: () => void;
}

const AddTransactionDialog = ({ isOpen, onClose, selectedDate, onTransactionAdded }: AddTransactionDialogProps) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    emoji: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const expenseCategories = [
    { value: 'Alimentação', emoji: '🍽️' },
    { value: 'Transporte', emoji: '🚗' },
    { value: 'Lazer', emoji: '🎬' },
    { value: 'Saúde', emoji: '💊' },
    { value: 'Casa', emoji: '🏠' },
    { value: 'Compras', emoji: '🛍️' },
    { value: 'Educação', emoji: '📚' },
    { value: 'Serviços', emoji: '🔧' },
    { value: 'Outros', emoji: '💰' }
  ];

  const incomeCategories = [
    { value: 'salary', emoji: '💼', label: 'Salário' },
    { value: 'other', emoji: '💰', label: 'Outros' }
  ];

  const currentCategories = activeTab === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (activeTab === 'expense') {
        const { error } = await supabase
          .from('expenses')
          .insert([{
            user_id: user?.id,
            description: formData.description,
            amount: parseFloat(formData.amount),
            category: formData.category,
            emoji: formData.emoji,
            date: selectedDate,
            expense_type: 'normal'
          }]);

        if (error) throw error;

        toast({
          title: "Gasto adicionado! 💸",
          description: `R$ ${formData.amount} em ${formData.category}`,
        });
      } else {
        const { error } = await supabase
          .from('income_entries')
          .insert([{
            user_id: user?.id,
            name: formData.description,
            amount: parseFloat(formData.amount),
            emoji: formData.emoji,
            receive_date: selectedDate,
            source_type: formData.category
          }]);

        if (error) throw error;

        toast({
          title: "Entrada adicionada! 💰",
          description: `R$ ${formData.amount} em ${formData.category}`,
        });
      }

      setFormData({ description: '', amount: '', category: '', emoji: '' });
      onTransactionAdded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    const category = currentCategories.find(c => c.value === value);
    setFormData({
      ...formData,
      category: value,
      emoji: category?.emoji || ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Adicionar Transação - {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'income' | 'expense')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4" />
              <span>Saída</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Entrada</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="expense" className="space-y-4 mt-0">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="destructive">Saída</Badge>
                <span className="text-sm text-muted-foreground">
                  Registrar um gasto
                </span>
              </div>
            </TabsContent>

            <TabsContent value="income" className="space-y-4 mt-0">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-green-100 text-green-800">Entrada</Badge>
                <span className="text-sm text-muted-foreground">
                  Registrar uma entrada
                </span>
              </div>
            </TabsContent>

            <Input
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />

            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.emoji} {(category as any).label || category.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className={`flex-1 ${
                  activeTab === 'income' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;