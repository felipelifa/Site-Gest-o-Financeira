import { ReactNode, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from './UpgradeModal';

interface PremiumGuardProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
}

const PremiumGuard = ({ children, feature, fallback }: PremiumGuardProps) => {
  const { hasAccess } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="premium_feature"
        feature={feature}
      />
      
      <div 
        onClick={() => setShowUpgradeModal(true)}
        className="cursor-pointer relative group"
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-magical/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg">
            <p className="text-sm font-semibold text-primary">🔒 Premium</p>
            <p className="text-xs text-muted-foreground">Clique para assinar</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumGuard;