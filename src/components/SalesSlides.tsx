import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  TrendingUp, 
  Shield, 
  Smartphone,
  Star,
  Check,
  ArrowRight,
  Zap,
  PiggyBank,
  Target,
  BarChart3,
  Wallet,
  Calendar,
  Gift,
  Clock,
  Users,
  Award,
  Download,
  Sparkles,
  CreditCard,
  DollarSign,
  TrendingDown,
  Play,
  Pause
} from "lucide-react";

const SalesSlides = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const totalSlides = 8;

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handlePurchase = () => {
    // Redirecionar para a página de checkout
    window.location.href = '/checkout';
  };

  const handleVerifyAccess = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para verificar o acesso.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifying(true);
      console.log('🔥 SALES: Verificando acesso para email:', email);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { email }
      });

      console.log('🔥 SALES: Resposta do verify-payment:', { data, error });

      if (error) throw error;

      if (data.hasValidPayment) {
        console.log('🔥 SALES: Acesso liberado! Redirecionando...');
        toast({
          title: "Acesso liberado! 🎉",
          description: "Redirecionando para o download...",
        });
        
        // Redirecionar para a página de download com email
        setTimeout(() => {
          navigate(`/download?email=${encodeURIComponent(email)}&verified=true`);
        }, 1000);
      } else {
        console.log('🔥 SALES: Acesso negado. Orders:', data.orders);
        toast({
          title: "Acesso negado",
          description: "Nenhum pagamento aprovado encontrado para este email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔥 SALES: Erro ao verificar pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Mock screenshots do app para simular a interface
  const AppMockup = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
    <Card className="bg-white/10 border-white/20 p-6 text-center">
      <Icon className="h-12 w-12 mx-auto mb-4 text-white" />
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
    </Card>
  );

  const slides = [
    // Slide 1: Bem-vindo - Design mais profissional
    {
      background: "bg-gradient-primary",
      content: (
        <div className="text-center text-white space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
              <PiggyBank className="h-32 w-32 mx-auto text-white relative z-10" />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-bold leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
                DinDin Mágico
              </h1>
              <p className="text-3xl font-light opacity-90">
                O aplicativo que vai transformar sua relação com o dinheiro
              </p>
              <Badge variant="secondary" className="text-xl px-8 py-3 font-semibold">
                <Sparkles className="mr-2 h-5 w-5" />
                Controle financeiro que funciona de verdade
              </Badge>
            </div>
          </div>
          <Button 
            onClick={nextSlide} 
            size="lg" 
            variant="secondary"
            className="text-2xl px-12 py-6 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            Descobrir como <ChevronRight className="ml-3 h-8 w-8" />
          </Button>
        </div>
      )
    },

    // Slide 2: Dor ampliada
 {
  background: "bg-gradient-to-br from-red-900 via-slate-900 to-slate-700",
  content: (
    <div className="text-center text-white space-y-10 mb-28"> {/* <-- margin-bottom aumentada! */}
      <div className="text-9xl animate-pulse">💸</div>
      <h2 className="text-5xl font-bold leading-tight">
        Cansado de ver seu dinheiro desaparecer?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Card className="bg-red-900/30 border-red-500/20 p-6">
          <TrendingDown className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold mb-2">Gastos descontrolados</h3>
          <p className="text-white/80">Não sabe onde seu dinheiro está indo</p>
        </Card>
        <Card className="bg-red-900/30 border-red-500/20 p-6">
          <Clock className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold mb-2">Tempo perdido</h3>
          <p className="text-white/80">Horas com planilhas complicadas</p>
        </Card>
        <Card className="bg-red-900/30 border-red-500/20 p-6">
          <Target className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold mb-2">Sonhos distantes</h3>
          <p className="text-white/80">Metas que nunca saem do papel</p>
        </Card>
      </div>
      {/* BOTÃO COM ESTILO MELHORADO */}
      <Button 
        onClick={nextSlide} 
        variant="accent" 
        size="lg"
        className="text-xl px-10 py-5 rounded-full bg-gradient-to-r from-[#ff3864] to-[#ffbe7b] shadow-xl border-0 hover:scale-105 transition"
      >
        Quero a solução <ArrowRight className="ml-2 h-6 w-6" />
      </Button>
    </div>
  )
},


    // Slide 3: Solução visual
    {
      background: "bg-gradient-success",
      content: (
        <div className="text-center text-white space-y-10">
          <h2 className="text-5xl font-bold mb-8">
            Conheça o DinDin Mágico
          </h2>
          <div className="relative max-w-md mx-auto">
            {/* Mockup do celular */}
            <div className="bg-black rounded-3xl p-2 shadow-2xl">
              <div className="bg-gradient-primary rounded-2xl p-8 h-96 relative overflow-hidden">
                <div className="text-center space-y-4">
                  <Wallet className="h-16 w-16 mx-auto text-white" />
                  <h3 className="text-2xl font-bold">R$ 2.847,50</h3>
                  <p className="text-sm opacity-80">Saldo disponível</p>
                  <div className="space-y-2 text-left mt-8">
                    <div className="bg-white/20 rounded-lg p-3 flex justify-between">
                      <span>🍕 Alimentação</span>
                      <span>R$ 420,00</span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 flex justify-between">
                      <span>🚗 Transporte</span>
                      <span>R$ 280,00</span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 flex justify-between">
                      <span>🎯 Meta: Viagem</span>
                      <span className="text-green-300">67%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <Zap className="h-8 w-8 mx-auto text-yellow-300" />
              <p className="font-semibold">Rápido</p>
            </div>
            <div className="text-center space-y-2">
              <Heart className="h-8 w-8 mx-auto text-red-300" />
              <p className="font-semibold">Intuitivo</p>
            </div>
            <div className="text-center space-y-2">
              <Shield className="h-8 w-8 mx-auto text-blue-300" />
              <p className="font-semibold">Seguro</p>
            </div>
            <div className="text-center space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-purple-300" />
              <p className="font-semibold">Mágico</p>
            </div>
          </div>
          <Button 
            onClick={nextSlide} 
            variant="secondary" 
            size="lg"
            className="text-xl px-10 py-5 rounded-full"
          >
            Ver recursos <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      )
    },

    // Slide 4: Recursos visuais (sem demo externa)
    {
  background: "bg-gradient-to-br from-[#7f5af0] via-[#635bff] to-[#00cfff]",
  content: (
    <div className="text-center text-white space-y-14 px-2 md:px-0">
      <h2 className="text-5xl md:text-6xl font-bold mb-8 drop-shadow-xl">
        <span className="bg-gradient-to-r from-white via-[#e0e0ff] to-[#a0e9ff] bg-clip-text text-transparent">
          Recursos que você vai amar
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <AppMockup 
          icon={BarChart3}
          title="Relatórios Visuais"
          description="Gráficos coloridos que mostram exatamente onde seu dinheiro está indo"
          className="bg-white/70 border border-[#7f5af0]/10 backdrop-blur-md rounded-2xl shadow-lg text-primary"
        />
        <AppMockup 
          icon={Target}
          title="Metas Inteligentes"
          description="Defina objetivos e acompanhe seu progresso em tempo real"
          className="bg-white/70 border border-[#635bff]/10 backdrop-blur-md rounded-2xl shadow-lg text-primary"
        />
        <AppMockup 
          icon={Calendar}
          title="Planejamento Mensal"
          description="Organize seus gastos e receitas de forma visual e prática"
          className="bg-white/70 border border-[#00cfff]/10 backdrop-blur-md rounded-2xl shadow-lg text-primary"
        />
        <AppMockup 
          icon={Gift}
          title="Controle Total"
          description="Categorias automáticas, lembretes e muito mais"
          className="bg-white/70 border border-[#7f5af0]/10 backdrop-blur-md rounded-2xl shadow-lg text-primary"
        />
      </div>
      <div className="bg-white/20 rounded-3xl p-8 max-w-2xl mx-auto mt-12 shadow-2xl border border-white/10">
        <p className="text-2xl font-semibold mb-2 text-[#7f5af0] drop-shadow">
          ⚡ Tudo isso em segundos, não em horas!
        </p>
        <p className="text-lg text-white/90 opacity-90">
          Enquanto outros apps complicam, o DinDin Mágico simplifica sua vida financeira
        </p>
      </div>
      <Button 
        onClick={nextSlide} 
        variant="secondary" 
        size="lg"
        className="text-xl px-10 py-5 rounded-full shadow-xl bg-[#7f5af0] hover:bg-[#635bff] text-white border-0 transition-all hover:scale-105"
      >
        Quero ter isso! <Sparkles className="ml-2 h-6 w-6" />
      </Button>
    </div>
  )
},


    // Slide 5: Conversão melhorada
    {
      background: "bg-gradient-magical",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-4">
            <Badge className="text-xl px-6 py-2 bg-yellow-500 text-black font-bold">
              🔥 OFERTA ESPECIAL
            </Badge>
            <h2 className="text-5xl font-bold">
              Acesso Vitalício por Apenas
            </h2>
          </div>
          
          <Card className="bg-white/10 border-white/20 max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 rounded-bl-2xl font-bold">
              LIMITADO
            </div>
            <CardContent className="p-10 space-y-8">
              <div className="text-center">
                <div className="text-gray-400 line-through text-2xl">R$ 97,90</div>
                <div className="text-7xl font-bold text-green-400">R$ 49,90</div>
                <div className="text-2xl opacity-90">Pagamento único • Sem mensalidades</div>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>✨ Controle financeiro completo</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>📊 Relatórios e gráficos ilimitados</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>🎯 Sistema de metas avançado</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>📱 Funciona em todos os dispositivos</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>🔒 Seus dados 100% privados</span>
                </div>
                <div className="flex items-center space-x-3 text-lg">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span>🆘 Suporte VIP vitalício</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Button 
              onClick={handlePurchase} 
              variant="secondary" 
              size="lg"
              className="text-2xl px-16 py-8 rounded-full shadow-2xl hover:scale-105 transition-all animate-pulse bg-green-500 hover:bg-green-400 text-black font-bold"
            >
              💳 COMPRAR AGORA - R$ 49,90
            </Button>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
              <span>🔒 Pagamento 100% seguro</span>
              <span>•</span>
              <span>⚡ Acesso imediato</span>
              <span>•</span>
              <span>🛡️ Garantia total</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Prova social melhorada
    {
      background: "bg-gradient-to-br from-purple-900 to-blue-900",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold">
              +5.000 pessoas já transformaram suas vidas
            </h2>
            <div className="flex justify-center items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-2xl font-bold ml-4">4.9/5</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white/10 border-white/20 transform hover:scale-105 transition-all">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-4 text-lg">
                  "Em 2 meses economizei R$ 800! Nunca consegui controlar meus gastos antes."
                </p>
                <p className="text-white/70 font-semibold">- Ana Carolina, 28 anos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 transform hover:scale-105 transition-all">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-4 text-lg">
                  "Finalmente consegui comprar meu carro! O app me ajudou a focar na meta."
                </p>
                <p className="text-white/70 font-semibold">- Rodrigo Silva, 35 anos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 transform hover:scale-105 transition-all">
              <CardContent className="p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-4 text-lg">
                  "Interface linda e super fácil. Minha filha de 16 anos também usa!"
                </p>
                <p className="text-white/70 font-semibold">- Márcia Santos, 42 anos</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-green-900/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">🎯 Resultado médio dos usuários:</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">67%</div>
                <p>Redução de gastos desnecessários</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">3x</div>
                <p>Mais metas financeiras alcançadas</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={nextSlide} 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-primary text-xl px-8 py-4"
          >
            Eu também quero esses resultados <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      )
    },

    // Slide 7: FAQ melhorado
    {
      background: "bg-gradient-to-br from-slate-800 to-slate-600",
      content: (
        <div className="text-center text-white space-y-10">
          <h2 className="text-5xl font-bold">Ainda tem dúvidas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto text-left">
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <DollarSign className="mr-3 h-6 w-6 text-green-400" />
                  É realmente vitalício?
                </h3>
                <p className="text-white/90 text-lg">Sim! Você paga R$ 49,90 uma única vez e usa para sempre. Sem pegadinhas, sem mensalidades ocultas.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-blue-400" />
                  Meus dados estão seguros?
                </h3>
                <p className="text-white/90 text-lg">100% seguros! Seus dados ficam apenas no seu dispositivo. Nem nós temos acesso às suas informações financeiras.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Smartphone className="mr-3 h-6 w-6 text-purple-400" />
                  Funciona em todos os dispositivos?
                </h3>
                <p className="text-white/90 text-lg">Sim! Celular, tablet, computador... Use onde quiser, quantas vezes quiser.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Users className="mr-3 h-6 w-6 text-orange-400" />
                  E se eu não gostar?
                </h3>
                <p className="text-white/90 text-lg">Oferecemos garantia de 7 dias. Não ficou satisfeito? Devolvemos seu dinheiro sem perguntas.</p>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            onClick={nextSlide} 
            variant="accent"
            size="lg"
            className="text-2xl px-12 py-6 rounded-full"
          >
            Sem mais dúvidas! Quero comprar <Target className="ml-3 h-8 w-8" />
          </Button>
        </div>
      )
    },

    // Slide 8: CTA Final urgência
    {
      background: "bg-gradient-primary",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-6">
            <Badge className="text-2xl px-8 py-3 bg-red-500 text-white font-bold animate-pulse">
              ⏰ ÚLTIMAS HORAS - DESCONTO 50%
            </Badge>
            <h2 className="text-6xl font-bold leading-tight">
              Sua nova vida financeira começa AGORA!
            </h2>
            <div className="text-8xl animate-bounce">🚀</div>
          </div>
          
          <div className="bg-white/10 rounded-3xl p-8 max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold">O que você ganha HOJE:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xl">
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Controle total das finanças</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Economia de até 30% por mês</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Metas alcançadas mais rápido</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-400" />
                <span>Paz de espírito financeira</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-4xl font-bold">
              <span className="line-through text-gray-400">R$ 97,90</span>
              <span className="text-green-400 ml-4">R$ 49,90</span>
            </div>
            <Button 
              onClick={handlePurchase} 
              variant="secondary" 
              size="lg"
              className="text-3xl px-20 py-10 rounded-full shadow-2xl hover:scale-105 transition-all bg-green-500 hover:bg-green-400 text-black font-bold animate-pulse"
            >
              💎 GARANTIR MINHA CÓPIA AGORA 💎
            </Button>
            <div className="space-y-2">
              <p className="text-xl font-semibold">⚡ Acesso liberado em 2 minutos</p>
              <div className="flex items-center justify-center space-x-6 text-lg opacity-90">
                <span>🔒 Pagamento seguro</span>
                <span>📱 Download imediato</span>
                <span>🛡️ Garantia 7 dias</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Seção de acesso para quem já comprou - FIXO NO TOPO */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-sm">
              <span className="font-semibold">Já comprou?</span> Acesse o download:
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm h-9 w-full sm:w-64"
              />
              <Button 
                onClick={handleVerifyAccess}
                disabled={verifying}
                size="sm"
                variant="accent"
                className="h-9 px-4 whitespace-nowrap"
              >
                {verifying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Acessar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide atual - com espaçamento para a barra fixa */}
      <div 
        className={`min-h-screen flex items-center justify-center p-4 md:p-8 pt-20 transition-all duration-500 ${slides[currentSlide].background}`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navegação */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3">
        {/* Botão anterior */}
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Indicadores de slide */}
        <div className="flex space-x-2">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Botão próximo */}
        <Button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Contador de slides */}
      <div className="fixed top-4 md:top-8 right-4 md:right-8 bg-black/30 backdrop-blur-sm rounded-full px-3 md:px-4 py-1 md:py-2 text-white text-sm md:text-base">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  );
};

export default SalesSlides;