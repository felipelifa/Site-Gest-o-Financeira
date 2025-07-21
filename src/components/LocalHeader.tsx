import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Settings, Target, PiggyBank, Calendar, BarChart3, Sparkles } from "lucide-react";
import { useLocalData } from "@/contexts/LocalDataContext";
import GoalManager from "./GoalManager";
import BudgetManager from "./BudgetManager";
import FixedExpenseManager from "./FixedExpenseManager";
import RecurringIncomeManager from "./RecurringIncomeManager";
import FinancialCalendar from "./FinancialCalendar";

const LocalHeader = () => {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const { profile } = useLocalData();

  const menuItems = [
    { id: "goals", label: "Metas", icon: Target, component: GoalManager },
    { id: "budget", label: "Orçamento", icon: PiggyBank, component: BudgetManager },
    { id: "fixed", label: "Gastos Fixos", icon: Calendar, component: FixedExpenseManager },
    { id: "income", label: "Renda", icon: BarChart3, component: RecurringIncomeManager },
    { id: "calendar", label: "Calendário", icon: Calendar, component: FinancialCalendar },
  ];

  const openSheet = (sheetId: string) => {
    setActiveSheet(sheetId);
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-magical flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-magical bg-clip-text text-transparent">
                DinDin Mágico
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:block text-sm text-muted-foreground">
            Olá, {profile.full_name}! ✨
          </div>
          
          <Sheet open={!!activeSheet} onOpenChange={() => closeSheet()}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] md:w-[500px]">
              <SheetHeader>
                <SheetTitle>Menu Principal</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => openSheet(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sheets específicos para cada funcionalidade */}
      {menuItems.map((item) => (
        <Sheet key={`${item.id}-sheet`} open={activeSheet === item.id} onOpenChange={() => closeSheet()}>
          <SheetContent side="right" className="w-full sm:w-[400px] md:w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <item.component />
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </header>
  );
};

export default LocalHeader;