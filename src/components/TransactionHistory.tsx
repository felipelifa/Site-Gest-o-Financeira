import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import PremiumGuard from "./PremiumGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useDateContext } from "@/contexts/DateContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  realId: string; // ID real sem prefixo
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  emoji: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;
  const { user } = useAuth();
  const { currentDate, refreshTrigger } = useDateContext();
  const { toast } = useToast();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, currentDate, refreshTrigger, sortOrder, viewMode, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      let expenseQuery = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .neq('expense_type', 'fixed'); // Excluir gastos fixos
      
      let incomeQuery = supabase
        .from('income_entries')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .eq('is_recurring', false); // Apenas entradas não recorrentes

      // Se está em modo atual, filtrar por mês
      if (viewMode === 'current') {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDate = startOfMonth.toISOString().split('T')[0];
        const endDate = endOfMonth.toISOString().split('T')[0];
        
        expenseQuery = expenseQuery
          .gte('date', startDate)
          .lte('date', endDate);
        
        incomeQuery = incomeQuery
          .gte('receive_date', startDate)
          .lte('receive_date', endDate);
      }

      // Adicionar paginação para modo histórico
      if (viewMode === 'all') {
        const offset = (currentPage - 1) * itemsPerPage;
        expenseQuery = expenseQuery
          .range(offset, offset + Math.floor(itemsPerPage / 2) - 1);
        incomeQuery = incomeQuery
          .range(offset, offset + Math.floor(itemsPerPage / 2) - 1);
      }

      // Ordenar
      expenseQuery = expenseQuery.order('date', { ascending: sortOrder === 'asc' });
      incomeQuery = incomeQuery.order('receive_date', { ascending: sortOrder === 'asc' });

      // Executar queries
      const [expenseResult, incomeResult] = await Promise.all([
        expenseQuery,
        incomeQuery
      ]);

      if (expenseResult.error) throw expenseResult.error;
      if (incomeResult.error) throw incomeResult.error;

      const expenses = expenseResult.data || [];
      const incomes = incomeResult.data || [];

      // Combinar e ordenar todas as transações
      const allTransactions: Transaction[] = [
        ...(expenses || []).map(expense => ({
          id: `expense-${expense.id}`,
          realId: expense.id,
          date: expense.date,
          type: 'expense' as const,
          amount: Number(expense.amount),
          category: expense.category,
          description: expense.description,
          emoji: expense.emoji || '💸'
        })),
        ...(incomes || []).map(income => ({
          id: `income-${income.id}`,
          realId: income.id,
          date: income.receive_date,
          type: 'income' as const,
          amount: Number(income.amount),
          category: income.source_type === 'salary' ? 'Salário' :
                   income.source_type === 'freelance' ? 'Freelance' :
                   income.source_type === 'sales' ? 'Vendas' :
                   income.source_type === 'investment' ? 'Investimentos' :
                   income.source_type === 'gift' ? 'Presente' :
                   income.source_type === 'cashback' ? 'Cashback' :
                   income.source_type === 'rental' ? 'Aluguel' :
                   'Outros',
          description: income.name,
          emoji: income.emoji || '💰'
        }))
      ];

      // Ordenar por data
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      setTransactions(allTransactions);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transaction: Transaction) => {
    try {
      const table = transaction.type === 'expense' ? 'expenses' : 'income_entries';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', transaction.realId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== transaction.id));
      
      toast({
        title: "Transação excluída! 🗑️",
        description: "A transação foi removida com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (loading) {
    return (
      <Card className="shadow-magical">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PremiumGuard feature="histórico completo de transações">
      <Card className="shadow-magical">
        <CardHeader>
          <div className="space-y-4">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-accent" />
              <span className="text-base md:text-lg">Histórico de Movimentações</span>
            </CardTitle>

          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Toggle entre mês atual e histórico completo */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('current');
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                Mês Atual
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('all');
                  setCurrentPage(1);
                }}
                className="text-xs"
              >
                Histórico Completo
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="flex items-center space-x-2 text-xs"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}</span>
              <span className="sm:hidden">{sortOrder === 'desc' ? 'Recentes' : 'Antigas'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma movimentação registrada
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione entradas e gastos para visualizar o histórico
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header da tabela - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-muted/30 rounded-lg text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Data</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Valor</div>
              <div className="col-span-3">Categoria</div>
              <div className="col-span-2">Descrição</div>
              <div className="col-span-1">Ações</div>
            </div>
            
            {/* Linhas da tabela */}
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Layout Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-3 items-center">
                  <div className="col-span-2 text-sm font-medium">
                    {formatDate(transaction.date)}
                  </div>
                  
                  <div className="col-span-2">
                    <Badge 
                      variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="col-span-3">
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{transaction.emoji}</span>
                      <span className="text-sm truncate" title={transaction.description}>
                        {transaction.description}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Layout Mobile e Tablet */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{transaction.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                    <span className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </PremiumGuard>
  );
};

export default TransactionHistory;