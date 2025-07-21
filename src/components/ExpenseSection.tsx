import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuickExpenseForm from "./QuickExpenseForm";
import ExpenseCard from "./ExpenseCard";


interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  emoji: string;
}

interface ExpenseSectionProps {
  expenses: Expense[];
  onAddExpense: (expense: { amount: number; description: string; category: string }) => void;
  onDeleteExpense: (id: string) => void;
  onExpenseAdded: () => void;
}

const ExpenseSection = ({ expenses, onAddExpense, onDeleteExpense, onExpenseAdded }: ExpenseSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Formulário de Entrada */}
      <QuickExpenseForm onAddExpense={onAddExpense} />

      {/* Lista de Gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gastos Recentes</CardTitle>
            <Badge variant="outline">{expenses.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum gasto anotado ainda. Que tal começar? 🚀
              </p>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={onDeleteExpense}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSection;