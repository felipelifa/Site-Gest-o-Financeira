import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Target, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
  deadline: string;
}

interface GoalManagerProps {
  onGoalsUpdate?: (goals: Goal[]) => void;
}

const GoalManager = ({ onGoalsUpdate }: GoalManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    emoji: "🎯",
    deadline: "",
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedGoals = data?.map(goal => ({
        id: goal.id,
        name: goal.name,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount || 0),
        emoji: goal.emoji || "🎯",
        deadline: goal.deadline,
      })) || [];

      setGoals(mappedGoals);
      onGoalsUpdate?.(mappedGoals);
    } catch (error: any) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const saveGoal = async () => {
    if (!user || !formData.name || !formData.target_amount || !formData.deadline) return;

    setIsLoading(true);
    try {
      const goalData = {
        user_id: user.id,
        name: formData.name,
        target_amount: Number(formData.target_amount),
        current_amount: Number(formData.current_amount || 0),
        emoji: formData.emoji,
        deadline: formData.deadline,
      };

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;

        toast({
          title: "Meta atualizada! 🎯",
          description: `${formData.name} foi atualizada com sucesso!`,
        });
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([goalData]);

        if (error) throw error;

        toast({
          title: "Meta criada! 🌟",
          description: `${formData.name} foi adicionada aos seus sonhos!`,
        });
      }

      resetForm();
      loadGoals();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta removida",
        description: "Meta foi removida com sucesso",
      });

      loadGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao remover meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      target_amount: "",
      current_amount: "",
      emoji: "🎯",
      deadline: "",
    });
    setEditingGoal(null);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      emoji: goal.emoji,
      deadline: goal.deadline,
    });
    setIsOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsOpen(true);
  };

  return (
    <>
      <Button onClick={openNewDialog} size="sm" className="bg-gradient-magical">
        <Plus className="h-4 w-4 mr-1" />
        Nova Meta
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🎯"
                  maxLength={2}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: iPhone novo"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Valor Meta (R$)</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="3500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current">Valor Atual (R$)</Label>
                <Input
                  id="current"
                  type="number"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  placeholder="1200"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo</Label>
              <Input
                id="deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="Ex: Dezembro 2024"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveGoal}
                disabled={isLoading || !formData.name || !formData.target_amount || !formData.deadline}
                className="flex-1 bg-gradient-success hover:opacity-90"
              >
                {isLoading ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de metas existentes para edição rápida */}
      {goals.length > 0 && (
        <div className="mt-4 space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{goal.emoji}</span>
                <div>
                  <p className="font-medium text-sm">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditDialog(goal)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteGoal(goal.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default GoalManager;