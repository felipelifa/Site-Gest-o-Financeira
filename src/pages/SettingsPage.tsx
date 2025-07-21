import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, LogOut, Crown, CreditCard, Calendar, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import SubscriptionModal from "@/components/SubscriptionModal";
import SyncSubscriptionButton from "@/components/SyncSubscriptionButton";

const SettingsPage = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { isPremium, subscriptionStatus, trialEndDate, subscriptionEndDate, trialDaysLeft, subscriptionDaysLeft, isTrialActive, planType } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado! 👋",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no Dindin Mágico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sistema Inteligente de Assinatura */}
          <Card className="shadow-magical lg:col-span-2 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <span>Sua Assinatura</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner de Status Inteligente */}
              {isPremium ? (
                // Usuario Premium Ativo
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/20 rounded-full p-2">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-lg">Premium Ativo ✨</h3>
                        <p className="text-sm text-muted-foreground">
                          {planType === 'yearly' ? 'Plano Anual' : 'Plano Mensal'} - Expira em: {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString('pt-BR') : 'Em breve'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {planType === 'yearly' ? 'R$ 99,00' : 'R$ 9,90'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        /{planType === 'yearly' ? 'ano' : 'mês'}
                      </p>
                      {subscriptionDaysLeft > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {subscriptionDaysLeft} dias restantes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : isTrialActive ? (
                // Usuario em Teste Gratis
                <div className={`bg-gradient-to-r ${
                  trialDaysLeft <= 3 
                    ? 'from-orange-50 to-red-50 border-orange-200' 
                    : 'from-blue-50 to-indigo-50 border-blue-200'
                } border rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-2 ${
                        trialDaysLeft <= 3 ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <Calendar className={`h-6 w-6 ${
                          trialDaysLeft <= 3 ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          trialDaysLeft <= 3 ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {trialDaysLeft <= 3 ? '⚠️ Teste terminando!' : '🎉 Teste Grátis Ativo'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {trialDaysLeft <= 3 
                            ? `Apenas ${trialDaysLeft} dias restantes` 
                            : `${trialDaysLeft} dias de teste gratuito`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">Grátis</p>
                      <p className="text-sm text-muted-foreground">até {new Date(trialEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Usuario com Teste Expirado
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-800 text-lg">🚫 Acesso Limitado</h3>
                        <p className="text-sm text-muted-foreground">
                          Seu teste gratuito expirou em {new Date(trialEndDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">Limitado</p>
                      <p className="text-sm text-muted-foreground">funcionalidades básicas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ação Inteligente Principal */}
              <div className="space-y-3">
                {isPremium ? (
                  // Usuario Premium - Botão de renovação
                  <div className="text-center space-y-3">
                    <p className="text-muted-foreground">
                      Obrigado por ser Premium! Renove sua assinatura quando necessário.
                    </p>
                    <Button 
                      onClick={() => setShowSubscriptionModal(true)}
                      size="lg"
                      className="w-full text-lg py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      ✨ Renovar Assinatura
                    </Button>
                  </div>
                ) : (
                  // Usuario não-premium - Botão de ação principal
                  <Button 
                    onClick={() => setShowSubscriptionModal(true)}
                    size="lg"
                    className={`w-full text-lg py-4 ${
                      isTrialActive 
                        ? trialDaysLeft <= 3 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                          : 'bg-gradient-magical hover:opacity-90'
                        : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                    } text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    {isTrialActive 
                      ? trialDaysLeft <= 3 
                        ? `🔥 Assinar Agora (${trialDaysLeft} dias restantes)`
                        : '✨ Assinar Premium'
                      : '🚀 Reativar Premium'
                    }
                  </Button>
                )}

                {/* Informações adicionais */}
                {!isPremium && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Cancele quando quiser</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Dados seguros</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>R$ 9,90/mês ou R$ 99,00/ano</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Notificações */}
          <Card className="shadow-magical">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expense-reminders">Lembretes de Gastos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações sobre gastos fixos vencendo
                  </p>
                </div>
                <Switch id="expense-reminders" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-updates">Atualizações de Metas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre progresso das suas metas
                  </p>
                </div>
                <Switch id="goal-updates" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="monthly-reports">Relatórios Mensais</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo mensal dos seus gastos e receitas
                  </p>
                </div>
                <Switch id="monthly-reports" />
              </div>
            </CardContent>
          </Card>


          {/* Conta */}
          <Card className="shadow-magical">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Se efetuou um pagamento e ainda não foi ativado o premium, use a sincronização:
                </p>
                <SyncSubscriptionButton />
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Deseja sair da sua conta?
                </p>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Fazer Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integração com outros serviços */}
          <Card className="shadow-magical lg:col-span-2">
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Integrações com bancos e cartões</p>
                <p className="text-sm mt-2">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default SettingsPage;