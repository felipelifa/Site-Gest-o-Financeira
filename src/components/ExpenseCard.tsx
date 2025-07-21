import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseCardProps {
  expense: {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    emoji?: string;
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExpenseCard = ({ expense, onDelete, onEdit }: ExpenseCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Alimentação': 'bg-orange-100 text-orange-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Lazer': 'bg-purple-100 text-purple-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Casa': 'bg-green-100 text-green-800',
      'Compras': 'bg-pink-100 text-pink-800',
      'Outros': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Outros'];
  };

  return (
    <Card className="hover:shadow-soft transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{expense.emoji || '💰'}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg">R$ {expense.amount.toFixed(2)}</span>
                <Badge className={getCategoryColor(expense.category)}>
                  {expense.category}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{expense.description}</p>
              <p className="text-xs text-muted-foreground">{expense.date}</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(expense.id)}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <Edit3 className="h-4 w-4 text-primary" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(expense.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;