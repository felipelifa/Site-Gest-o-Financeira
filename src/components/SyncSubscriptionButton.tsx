import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const SyncSubscriptionButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('sync-subscription-status');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sincronização concluída",
        description: `Processadas ${data.processed} assinaturas. Recarregue a página para ver as mudanças.`,
      });
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar status das assinaturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Sincronizando...' : 'Sincronizar Status Premium'}
    </Button>
  );
};

export default SyncSubscriptionButton;