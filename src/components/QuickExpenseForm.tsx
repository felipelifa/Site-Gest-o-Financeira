import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Declaração global para TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface QuickExpenseFormProps {
  onAddExpense: (expense: { amount: number; description: string; category: string }) => void;
}

const QuickExpenseForm = ({ onAddExpense }: QuickExpenseFormProps) => {
  const [quickText, setQuickText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const motivationalMessages = [
    "Parabéns! Mais um gasto anotado! 🎉",
    "Você está no controle! 💪",
    "Que organização incrível! ⭐",
    "Seu futuro eu agradece! 🚀",
    "Rumo aos seus sonhos! ✨"
  ];

  const parseQuickText = (text: string) => {
    // Parse texto rápido como "40 mercado" ou "gastei 20 lanche"
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const numbers = cleanText.match(/\d+/g);
    const amount = numbers ? parseFloat(numbers[0]) : 0;
    
    let category = "Outros";
    let description = text;
    
    if (cleanText.includes("mercado") || cleanText.includes("supermercado")) {
      category = "Alimentação";
    } else if (cleanText.includes("lanche") || cleanText.includes("comida")) {
      category = "Alimentação";
    } else if (cleanText.includes("uber") || cleanText.includes("transporte")) {
      category = "Transporte";
    } else if (cleanText.includes("cinema") || cleanText.includes("lazer")) {
      category = "Lazer";
    }
    
    return { amount, description, category };
  };

  const handleQuickAdd = () => {
    if (!quickText.trim()) return;
    
    const expense = parseQuickText(quickText);
    if (expense.amount > 0) {
      onAddExpense(expense);
      setQuickText("");
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast({
        title: randomMessage,
        description: `R$ ${expense.amount.toFixed(2)} anotado com sucesso!`,
        duration: 3000,
      });
    }
  };

  const handleVoiceInput = async () => {
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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;
      
      setIsListening(true);
      
      toast({
        title: "Escutando... 🎤",
        description: "Fale seu gasto agora",
      });
      
      recognition.onresult = (event) => {
        if (event.results && event.results[0]) {
          const transcript = event.results[0][0].transcript;
          setQuickText(transcript);
          setIsListening(false);
          
          toast({
            title: "Texto reconhecido! 🎯",
            description: `"${transcript}"`,
          });
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Tente novamente ou digite manualmente";
        if (event.error === 'not-allowed') {
          errorMessage = "Permita o acesso ao microfone nas configurações do navegador";
        } else if (event.error === 'no-speech') {
          errorMessage = "Nenhuma fala detectada";
        } else if (event.error === 'network') {
          errorMessage = "Erro de conexão. Verifique sua internet";
        }
        
        toast({
          title: "Erro no reconhecimento",
          description: errorMessage,
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      
    } catch (error) {
      setIsListening(false);
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique as permissões do navegador",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-magical border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span>Anotar Gasto Rápido</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Ex: 40 mercado, gastei 20 lanche..."
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
            className="flex-1"
          />
          <Button 
            onClick={handleQuickAdd}
            className="bg-gradient-success hover:opacity-90"
            disabled={!quickText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={handleVoiceInput}
          className={`w-full ${isListening ? 'bg-destructive/10 border-destructive/30' : ''}`}
        >
          <Mic className={`h-4 w-4 mr-2 ${isListening ? 'text-destructive' : ''}`} />
          {isListening ? 'Escutando...' : 'Falar'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          💡 Dica: Digite rapidamente como "40 mercado" ou fale naturalmente!
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickExpenseForm;