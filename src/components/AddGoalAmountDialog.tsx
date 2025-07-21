import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Plus, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddGoalAmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: {
    id: string;
    name: string;
    emoji: string;
    current_amount: number;
    target_amount: number;
  };
  onAmountAdded: () => void;
}

const AddGoalAmountDialog = ({ isOpen, onClose, goal, onAmountAdded }: AddGoalAmountDialogProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleAddAmount = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    try {
      const newCurrentAmount = goal.current_amount + Number(amount);
      
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: "Dinheiro adicionado! 💰",
        description: `R$ ${Number(amount).toFixed(2)} foi adicionado à meta ${goal.name}`,
      });

      setAmount("");
      onAmountAdded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar valor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Comando de voz não suportado",
        description: "Seu navegador não suporta reconhecimento de voz",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;
      
      setIsListening(true);
      
      toast({
        title: "Escutando... 🎤",
        description: `Diga algo como: 'Guardei 100 reais para ${goal.name}'`,
      });
      
      recognition.onresult = (event: any) => {
        if (event.results && event.results[0]) {
          const transcript = event.results[0][0].transcript.toLowerCase();
          processVoiceInput(transcript);
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
        toast({
          title: "Erro no reconhecimento",
          description: "Tente novamente ou digite manualmente",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      setIsListening(false);
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique as permissões do navegador",
        variant: "destructive",
      });
    }
  };

  const processVoiceInput = (transcript: string) => {
    // Extrair valor
    const valueMatches = transcript.match(/(\d+(?:[.,]\d+)?)\s*(?:reais?|real|r\$)?/i);
    const extractedAmount = valueMatches ? parseFloat(valueMatches[1].replace(',', '.')) : 0;
    
    if (extractedAmount > 0) {
      setAmount(extractedAmount.toString());
      toast({
        title: "Comando de voz processado! 🎤",
        description: `Detectado: R$ ${extractedAmount.toFixed(2)} para ${goal.name}`,
      });
    } else {
      toast({
        title: "Valor não detectado",
        description: "Tente dizer algo como 'Guardei 100 reais'",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setAmount("");
    setIsListening(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <span>Adicionar à Meta</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Meta info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{goal.emoji}</span>
              <h3 className="font-semibold">{goal.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Atual: R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
            </p>
          </div>

          {/* Botão de Voz */}
          <div className="text-center">
            <Button
              onClick={handleVoiceInput}
              variant={isListening ? "destructive" : "secondary"}
              size="sm"
              className="px-4 py-2 text-sm font-medium"
            >
              <Mic className="h-4 w-4 mr-2" />
              {isListening ? "🛑 Parar" : "🎤 Usar voz"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              {`"Guardei 100 reais para ${goal.name}"`}
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Quanto você guardou? (R$)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50.00"
              min="0.01"
              step="0.01"
              autoFocus
            />
          </div>

          {/* Preview */}
          {amount && Number(amount) > 0 && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-success-foreground">
                Novo total: R$ {(goal.current_amount + Number(amount)).toFixed(2)}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAmount}
              disabled={isLoading || !amount || Number(amount) <= 0}
              className="flex-1 bg-gradient-success hover:opacity-90"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalAmountDialog;