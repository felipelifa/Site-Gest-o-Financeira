import { Button } from "@/components/ui/button";
import { Sparkles, Menu, User, LogOut, BarChart3, Target, Settings, CreditCard, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-gradient-primary shadow-soft sticky top-0 z-50">
      <div className="w-full px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-1 md:space-x-2">
            <Sparkles className="text-white h-6 w-6 md:h-8 md:w-8" />
            <h1 className="text-white text-lg md:text-2xl font-bold">DinDinMágico</h1>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white hover:bg-white/10 ${
                    location.pathname === '/dashboard' ? 'bg-white/20' : ''
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/reports">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white hover:bg-white/10 ${
                    location.pathname === '/reports' ? 'bg-white/20' : ''
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </Link>
              
              <Link to="/goals">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white hover:bg-white/10 ${
                    location.pathname === '/goals' ? 'bg-white/20' : ''
                  }`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Metas
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white hover:bg-white/10 ${
                    location.pathname === '/settings' ? 'bg-white/20' : ''
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
            
            {/* Menu mobile */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card">
                  <Link to="/dashboard">
                    <DropdownMenuItem className={location.pathname === '/dashboard' ? 'bg-accent' : ''}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/reports">
                    <DropdownMenuItem className={location.pathname === '/reports' ? 'bg-accent' : ''}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatórios
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/goals">
                    <DropdownMenuItem className={location.pathname === '/goals' ? 'bg-accent' : ''}>
                      <Target className="h-4 w-4 mr-2" />
                      Metas
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem className={location.pathname === '/settings' ? 'bg-accent' : ''}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/email-login'}
                  className="text-primary"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Trocar de conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;