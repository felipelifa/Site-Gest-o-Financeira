import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DateProvider } from "@/contexts/DateContext";
import { LocalDataProvider } from "@/contexts/LocalDataContext";
import LocalDashboard from "./components/LocalDashboard";
import OfflineIndicator from "./components/OfflineIndicator";
import PWAInstallButton from "./components/PWAInstallButton";
import PWAInstallBanner from "./components/PWAInstallBanner";

const queryClient = new QueryClient();

function StandaloneApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocalDataProvider>
          <DateProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PWAInstallBanner />
            <PWAInstallButton />
            <LocalDashboard />
          </DateProvider>
        </LocalDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default StandaloneApp;