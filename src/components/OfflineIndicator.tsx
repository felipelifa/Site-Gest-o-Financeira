import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <Badge variant="destructive" className="fixed top-2 right-2 z-50">
      <WifiOff className="h-3 w-3 mr-1" />
      Offline
    </Badge>
  );
};

export default OfflineIndicator;