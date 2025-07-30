import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft, Heart, TrendingUp, Shield, Smartphone, Star, Check, ArrowRight, Zap, PiggyBank, Target, BarChart3, Wallet, Calendar, Gift, Clock, Users, Award, Download, Sparkles, CreditCard, DollarSign, TrendingDown, Play, Pause, CheckCircle2, Crown, Rocket, Siren as Fire, Timer } from "lucide-react";

const ImprovedSalesSlides = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const totalSlides = 10; // Aumentamos para 10 slides

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // URL do Kiwify - substitua pela sua URL real
  const KIWIFY_CHECKOUT_URL = "https://kiwify.app/checkout/SEU_PRODUTO_ID";

  const handleKiwifyCheckout = () => {
    // Redirecionar para o checkout do Kiwify
    window.open(KIWIFY_CHECKOUT_URL, '_blank');
    
    toast({
      title: "Redirecionando para o checkout! 🚀",
      description: "Você será direcionado para finalizar sua compra no Kiwify.",
    });
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
      
      // Verificar se existe uma compra aprovada no Kiwify
      const { data, error } = await supabase.functions.invoke('verify-kiwify-purchase', {
        body: { email }
      });

      if (error) throw error;

      if (data.hasValidPurchase) {
        toast({
          title: "Acesso liberado! 🎉",
          description: "Redirecionando para o dashboard...",
        });
        
        // Criar conta automaticamente se não existir
        await createUserAccount(email, data.customerData);
        
        setTimeout(() => {
          navigate(`/dashboard`);
        }, 1000);
      } else {
        toast({
          title: "Acesso negado",
          description: "Nenhuma compra aprovada encontrada para este email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar compra:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const createUserAccount = async (email: string, customerData: any) => {
    try {
      // Tentar fazer login primeiro
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'kiwify_temp_password' // Senha temporária
      });

      if (signInError) {
        // Se não conseguir fazer login, criar conta
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: 'kiwify_temp_password', // Senha temporária
          options: {
            data: {
              full_name: customerData?.name || email.split('@')[0],
              kiwify_customer_id: customerData?.id,
              created_via: 'kiwify'
            }
          }
        });

        if (signUpError) {
          console.error('Erro ao criar conta:', signUpError);
          return;
        }

        // Ativar premium automaticamente
        if (signUpData.user) {
          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              subscription_status: 'active',
              kiwify_customer_id: customerData?.id
            })
            .eq('id', signUpData.user.id);
        }
      } else {
        // Se conseguiu fazer login, ativar premium
        if (signInData.user) {
          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              subscription_status: 'active',
              kiwify_customer_id: customerData?.id
            })
            .eq('id', signInData.user.id);
        }
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar conta:', error);
    }
  };

  const slides = [
    // Slide 1: Hook mais forte
    {
      background: "bg-gradient-to-br from-red-600 via-red-700 to-red-800",
      content: (
        <div className="text-center text-white space-y-8">
          <div className="space-y-6">
            <div className="text-8xl animate-pulse">😰</div>
            <h1 className="text-6xl font-bold leading-tight">
              Você está <span className="text-yellow-300">perdendo dinheiro</span> todos os dias!
            </h1>
            <p className="text-2xl opacity-90 max-w-4xl mx-auto">
              Enquanto você não controla seus gastos, <strong>R$ 500+ por mês</strong> estão escapando das suas mãos sem você perceber
            </p>
            <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-xl font-semibold mb-2">⚠️ FATO CHOCANTE:</p>
              <p className="text-lg">
                90% das pessoas não sabem onde gastaram mais de <strong>R$ 300</strong> no último mês
              </p>
            </div>
          </div>
          <button 
            onClick={nextSlide} 
            className="bg-yellow-500 hover:bg-yellow-400 text-black text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all animate-bounce"
          >
            😱 Isso é comigo! Quero descobrir onde está meu dinheiro
          </button>
        </div>
      )
    },

    // Slide 2: Agitação da dor
    {
      background: "bg-gradient-to-br from-gray-900 via-red-900 to-black",
      content: (
        <div className="text-center text-white space-y-10">
          <h2 className="text-5xl font-bold leading-tight">
            Reconhece essas situações? 👇
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-red-900/30 border-red-500/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-4 text-red-300">Final do mês chegou...</h3>
              <p className="text-lg text-white/90">
                "Nossa, onde foi parar meu dinheiro? Juro que não gastei tanto assim!"
              </p>
            </Card>
            
            <Card className="bg-red-900/30 border-red-500/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">😰</div>
              <h3 className="text-2xl font-bold mb-4 text-red-300">Conta no vermelho</h3>
              <p className="text-lg text-white/90">
                "De novo?! Como assim não tenho dinheiro? Acabei de receber o salário!"
              </p>
            </Card>
            
            <Card className="bg-red-900/30 border-red-500/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-red-300">Sonhos distantes</h3>
              <p className="text-lg text-white/90">
                "Queria tanto comprar aquilo, mas nunca sobra dinheiro..."
              </p>
            </Card>
            
            <Card className="bg-red-900/30 border-red-500/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-red-300">Planilhas confusas</h3>
              <p className="text-lg text-white/90">
                "Tentei controlar no Excel, mas é muito complicado e sempre esqueço..."
              </p>
            </Card>
          </div>
          
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-yellow-300 mb-4">
              🔥 Se você se identificou com pelo menos 1 situação...
            </h3>
            <p className="text-xl">
              Você está no lugar certo! Chegou a hora de <strong>PARAR DE PERDER DINHEIRO</strong> e começar a ter controle total!
            </p>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            💪 CHEGA! Quero ter controle total! <ArrowRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 3: Apresentação da solução com mais impacto
    {
      background: "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800",
      content: (
        <div className="text-center text-white space-y-12">
          <div className="space-y-6">
            <div className="text-7xl">🎯</div>
            <h2 className="text-6xl font-bold leading-tight">
              Apresento o <span className="text-yellow-300">DinDin Mágico</span>
            </h2>
            <p className="text-2xl max-w-4xl mx-auto">
              O único app que transforma pessoas <strong>descontroladas financeiramente</strong> em 
              <strong className="text-green-300"> mestres do próprio dinheiro</strong> em apenas 30 dias!
            </p>
          </div>

          {/* Mockup melhorado */}
          <div className="relative max-w-sm mx-auto">
            <div className="bg-black/80 rounded-3xl p-3 shadow-2xl border-4 border-white/20">
              <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 rounded-2xl p-8 h-96 relative overflow-hidden">
                <div className="text-center space-y-4">
                  <div className="bg-white/20 rounded-full p-3 w-fit mx-auto">
                    <Wallet className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">R$ 3.247,80</h3>
                  <p className="text-white/80 font-medium">💰 Dinheiro controlado</p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-white font-medium">🍕 Alimentação</span>
                      <span className="text-green-300 font-bold">-15%</span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-white font-medium">🎯 Meta: Viagem</span>
                      <span className="text-yellow-300 font-bold">87%</span>
                    </div>
                    <div className="bg-green-500/30 rounded-lg p-3 text-center">
                      <span className="text-white font-bold">✅ Economia: R$ 890</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="bg-white/20 rounded-full p-4 w-fit mx-auto">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="font-bold text-lg">Resultados em 7 dias</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white/20 rounded-full p-4 w-fit mx-auto">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <p className="font-bold text-lg">100% Seguro</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white/20 rounded-full p-4 w-fit mx-auto">
                <Target className="h-8 w-8 text-green-400" />
              </div>
              <p className="font-bold text-lg">Metas Automáticas</p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-white/20 rounded-full p-4 w-fit mx-auto">
                <Crown className="h-8 w-8 text-purple-400" />
              </div>
              <p className="font-bold text-lg">Método Exclusivo</p>
            </div>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            🤩 Quero ver como funciona! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 4: Prova social forte
    {
      background: "bg-gradient-to-br from-green-600 via-emerald-600 to-green-800",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold">
              +12.847 pessoas já transformaram suas vidas! 🎉
            </h2>
            <div className="flex justify-center items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-10 w-10 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-3xl font-bold ml-4">4.9/5</span>
            </div>
            <p className="text-xl">Baseado em mais de 8.000 avaliações reais</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="flex space-x-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-4xl mb-4">💰</div>
              <p className="text-white mb-4 text-lg font-medium">
                "Em 3 semanas economizei <strong className="text-green-300">R$ 1.200</strong>! Nunca pensei que fosse possível. Agora sei exatamente onde vai cada centavo."
              </p>
              <p className="text-white/70 font-semibold">- Marina Santos, 32 anos</p>
              <p className="text-green-300 text-sm mt-2">✅ Verificado pelo Kiwify</p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="flex space-x-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-4xl mb-4">🏠</div>
              <p className="text-white mb-4 text-lg font-medium">
                "Consegui juntar a entrada do meu apartamento em <strong className="text-green-300">8 meses</strong>! O app me mostrou onde eu estava desperdiçando dinheiro."
              </p>
              <p className="text-white/70 font-semibold">- Carlos Oliveira, 28 anos</p>
              <p className="text-green-300 text-sm mt-2">✅ Verificado pelo Kiwify</p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="flex space-x-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-4xl mb-4">✈️</div>
              <p className="text-white mb-4 text-lg font-medium">
                "Realizei o sonho da viagem para a Europa! O DinDin me ajudou a economizar <strong className="text-green-300">R$ 8.000</strong> em 1 ano."
              </p>
              <p className="text-white/70 font-semibold">- Ana Paula, 35 anos</p>
              <p className="text-green-300 text-sm mt-2">✅ Verificado pelo Kiwify</p>
            </Card>
          </div>
          
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-yellow-300 mb-4">
              📊 Resultados médios dos nossos usuários:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400">73%</div>
                <p className="text-lg">Redução de gastos desnecessários</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400">R$ 847</div>
                <p className="text-lg">Economia média por mês</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400">4x</div>
                <p className="text-lg">Mais metas alcançadas</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            🚀 EU TAMBÉM QUERO ESSES RESULTADOS! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 5: Recursos detalhados
    {
      background: "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800",
      content: (
        <div className="text-center text-white space-y-12">
          <h2 className="text-5xl font-bold">
            Veja tudo que você vai receber 👇
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Controle Automático de Gastos</h3>
              <p className="text-white/90 text-sm mb-4">
                Categorização inteligente que aprende seus hábitos e organiza tudo automaticamente
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 197</div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Relatórios Visuais Inteligentes</h3>
              <p className="text-white/90 text-sm mb-4">
                Gráficos que mostram exatamente onde você está perdendo dinheiro
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 147</div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🎤</div>
              <h3 className="text-xl font-bold mb-3">Comando de Voz Mágico</h3>
              <p className="text-white/90 text-sm mb-4">
                Anote gastos falando: "Gastei 50 reais no almoço" - pronto!
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 97</div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3">Sistema de Metas Gamificado</h3>
              <p className="text-white/90 text-sm mb-4">
                Conquiste badges e mantenha-se motivado para alcançar seus objetivos
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 127</div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">App Multiplataforma</h3>
              <p className="text-white/90 text-sm mb-4">
                Funciona no celular, tablet e computador. Seus dados sempre sincronizados
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 167</div>
            </Card>

            <Card className="bg-white/10 border-white/20 p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
              <p className="text-white/90 text-sm mb-4">
                Seus dados ficam apenas no seu dispositivo. Nem nós temos acesso!
              </p>
              <div className="text-green-300 font-bold">Valor: R$ 97</div>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-yellow-300 mb-4">
              💎 Valor total: R$ 832
            </h3>
            <p className="text-xl mb-4">
              Mas hoje você não vai pagar nem R$ 500... nem R$ 300... nem R$ 200...
            </p>
            <div className="text-5xl font-bold text-green-400 mb-2">
              Apenas R$ 97
            </div>
            <p className="text-lg text-white/90">
              Pagamento único • Acesso vitalício • Sem mensalidades
            </p>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            💰 QUERO GARANTIR MINHA CÓPIA! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 6: Urgência e escassez
    {
      background: "bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-6">
            <Badge className="text-2xl px-8 py-3 bg-red-500 text-white font-bold animate-pulse">
              🔥 ATENÇÃO: OFERTA POR TEMPO LIMITADO
            </Badge>
            <h2 className="text-6xl font-bold leading-tight">
              Últimas <span className="text-yellow-300">48 horas</span> com desconto!
            </h2>
            <div className="text-8xl animate-bounce">⏰</div>
          </div>
          
          <div className="bg-black/30 rounded-3xl p-8 max-w-4xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold">⚡ DESCONTO RELÂMPAGO ⚡</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-gray-400 line-through text-3xl">R$ 297</div>
                <div className="text-sm text-gray-400">Preço normal</div>
              </div>
              <div className="text-6xl">→</div>
              <div className="text-center">
                <div className="text-6xl font-bold text-green-400">R$ 97</div>
                <div className="text-xl text-green-300">67% OFF</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <span>Acesso vitalício</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <span>Todas as funcionalidades</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <span>Suporte VIP incluso</span>
              </div>
            </div>
          </div>

          <div className="bg-red-500/20 border-2 border-red-400 rounded-2xl p-6 max-w-3xl mx-auto">
            <h4 className="text-2xl font-bold text-red-300 mb-4">
              ⚠️ CUIDADO: Esta oferta expira em breve!
            </h4>
            <p className="text-lg">
              Depois das 48h, o preço volta para R$ 297. Não perca esta oportunidade única!
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleKiwifyCheckout}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-3xl px-16 py-8 rounded-full font-bold shadow-2xl hover:scale-105 transition-all animate-pulse"
            >
              🚀 GARANTIR DESCONTO DE 67% AGORA!
            </button>
            <div className="flex items-center justify-center space-x-6 text-lg opacity-90">
              <span>🔒 Pagamento 100% seguro</span>
              <span>⚡ Acesso imediato</span>
              <span>🛡️ Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Comparação com concorrentes
    {
      background: "bg-gradient-to-br from-slate-800 to-slate-600",
      content: (
        <div className="text-center text-white space-y-10">
          <h2 className="text-5xl font-bold">
            DinDin Mágico vs. Outros Apps 🥊
          </h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Outros apps */}
              <Card className="bg-red-900/30 border-red-500/20 p-6">
                <h3 className="text-2xl font-bold mb-6 text-red-300">Outros Apps</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Interface confusa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Mensalidades caras</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Sem comando de voz</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Dados na nuvem (inseguro)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Suporte ruim</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-red-400">R$ 29,90/mês</div>
                  <div className="text-sm text-red-300">= R$ 358,80/ano</div>
                </div>
              </Card>

              {/* DinDin Mágico */}
              <Card className="bg-gradient-to-br from-green-600 to-emerald-700 border-green-400 border-2 p-6 transform scale-110 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-black font-bold px-4 py-2">
                    👑 MELHOR ESCOLHA
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">DinDin Mágico</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300 text-xl">✅</span>
                    <span>Interface super simples</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300 text-xl">✅</span>
                    <span>Pagamento único</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300 text-xl">✅</span>
                    <span>Comando de voz mágico</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300 text-xl">✅</span>
                    <span>100% offline e seguro</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300 text-xl">✅</span>
                    <span>Suporte VIP vitalício</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-300">R$ 97</div>
                  <div className="text-sm text-green-200">Pagamento único!</div>
                </div>
              </Card>

              {/* Planilhas */}
              <Card className="bg-gray-800/30 border-gray-500/20 p-6">
                <h3 className="text-2xl font-bold mb-6 text-gray-300">Planilhas</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Muito complicado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Fácil de esquecer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Sem automação</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Sem relatórios visuais</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span>Perda de tempo</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-gray-400">Grátis</div>
                  <div className="text-sm text-gray-400">Mas você desiste em 1 semana</div>
                </div>
              </Card>
            </div>
          </div>

          <div className="bg-green-600/20 border-2 border-green-400 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-green-300 mb-4">
              🎯 A escolha é óbvia, não é?
            </h3>
            <p className="text-xl">
              Enquanto outros cobram <strong>R$ 358/ano</strong>, você paga <strong>R$ 97 uma vez</strong> e usa para sempre!
            </p>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            💎 SIM! Quero a melhor opção! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 8: Garantia e risco zero
    {
      background: "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700",
      content: (
        <div className="text-center text-white space-y-10">
          <div className="space-y-6">
            <div className="text-8xl">🛡️</div>
            <h2 className="text-5xl font-bold leading-tight">
              Garantia <span className="text-yellow-300">Blindada</span> de 30 dias!
            </h2>
            <p className="text-2xl max-w-4xl mx-auto">
              Teste o DinDin Mágico por <strong>30 dias completos</strong>. Se não ficar satisfeito, devolvemos <strong>100% do seu dinheiro</strong>!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-3">Reembolso Simples</h3>
              <p className="text-white/90">
                Basta enviar um email e devolvemos seu dinheiro em até 24h. Sem perguntas, sem burocracia.
              </p>
            </Card>

            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Processo Rápido</h3>
              <p className="text-white/90">
                Não precisa explicar motivos. Disse que quer o dinheiro de volta? Pronto, já está na sua conta.
              </p>
            </Card>

            <Card className="bg-white/10 border-white/20 p-8 transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3">Confiança Total</h3>
              <p className="text-white/90">
                Mais de 12.000 clientes satisfeitos. Nossa taxa de reembolso é menor que 2%.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-green-300 mb-4">
              🎯 Ou seja: RISCO ZERO para você!
            </h3>
            <p className="text-xl mb-4">
              Você tem <strong>30 dias completos</strong> para testar tudo. Se não economizar pelo menos R$ 200 no primeiro mês, devolvemos seu dinheiro!
            </p>
            <div className="text-2xl font-bold text-yellow-300">
              Garantia de Economia ou Dinheiro de Volta! 💰
            </div>
          </div>

          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 max-w-3xl mx-auto">
            <p className="text-xl font-bold">
              🔥 Mais de 94% dos nossos clientes economizam mais de R$ 500 no primeiro mês!
            </p>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            🛡️ PERFEITO! Quero testar sem risco! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 9: Objeções e FAQ
    {
      background: "bg-gradient-to-br from-slate-700 to-slate-900",
      content: (
        <div className="text-center text-white space-y-10">
          <h2 className="text-5xl font-bold">
            "Mas e se..." 🤔
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Vamos esclarecer suas dúvidas mais comuns:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto text-left">
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-yellow-300">
                <DollarSign className="mr-3 h-6 w-6" />
                "É realmente vitalício?"
              </h3>
              <p className="text-white/90">
                <strong>SIM!</strong> Você paga R$ 97 uma única vez e usa para sempre. Sem pegadinhas, sem taxas ocultas, sem mensalidades surpresa.
              </p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-blue-300">
                <Shield className="mr-3 h-6 w-6" />
                "Meus dados estão seguros?"
              </h3>
              <p className="text-white/90">
                <strong>100% seguros!</strong> Seus dados ficam apenas no seu dispositivo. Nem nós temos acesso às suas informações financeiras.
              </p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-green-300">
                <Smartphone className="mr-3 h-6 w-6" />
                "Funciona no meu celular?"
              </h3>
              <p className="text-white/90">
                <strong>Funciona em tudo!</strong> Android, iPhone, tablet, computador... Use onde quiser, quantas vezes quiser.
              </p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-purple-300">
                <Users className="mr-3 h-6 w-6" />
                "E se eu não souber usar?"
              </h3>
              <p className="text-white/90">
                <strong>Impossível!</strong> É tão simples que até criança usa. Além disso, temos suporte VIP para te ajudar em tudo.
              </p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-red-300">
                <Heart className="mr-3 h-6 w-6" />
                "E se eu não gostar?"
              </h3>
              <p className="text-white/90">
                <strong>Sem problemas!</strong> Você tem 30 dias para testar. Não gostou? Devolvemos 100% do seu dinheiro.
              </p>
            </Card>
            
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-orange-300">
                <Clock className="mr-3 h-6 w-6" />
                "Quanto tempo para ver resultados?"
              </h3>
              <p className="text-white/90">
                <strong>7 dias!</strong> Na primeira semana você já vai ver onde estava perdendo dinheiro e começar a economizar.
              </p>
            </Card>
          </div>
          
          <button 
            onClick={nextSlide} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl px-12 py-6 rounded-full font-bold shadow-2xl hover:scale-105 transition-all"
          >
            ✅ Todas as dúvidas esclarecidas! Quero comprar! <ChevronRight className="ml-3 h-8 w-8" />
          </button>
        </div>
      )
    },

    // Slide 10: CTA Final com urgência máxima
    {
      background: "bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600",
      content: (
        <div className="text-center text-white space-y-8">
          <div className="space-y-6">
            <Badge className="text-3xl px-12 py-4 bg-red-500 text-white font-bold animate-pulse">
              🚨 ÚLTIMAS HORAS - DESCONTO EXPIRA EM BREVE!
            </Badge>
            <h2 className="text-6xl font-bold leading-tight">
              Sua transformação financeira começa <span className="text-yellow-300">AGORA!</span>
            </h2>
            <div className="text-9xl animate-bounce">🚀</div>
          </div>
          
          <div className="bg-black/30 rounded-3xl p-8 max-w-4xl mx-auto space-y-6">
            <h3 className="text-4xl font-bold">🎁 OFERTA ESPECIAL DE LANÇAMENTO</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-gray-400 line-through text-4xl">R$ 297</div>
                <div className="text-lg text-gray-400">Preço normal</div>
              </div>
              <div className="text-8xl">→</div>
              <div className="text-center">
                <div className="text-8xl font-bold text-green-400">R$ 97</div>
                <div className="text-2xl text-green-300">67% OFF</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <span>Acesso vitalício</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <span>Garantia de 30 dias</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <span>Suporte VIP incluso</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleKiwifyCheckout}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-4xl px-20 py-10 rounded-full font-bold shadow-2xl hover:scale-105 transition-all animate-pulse"
            >
              💎 GARANTIR MINHA TRANSFORMAÇÃO - R$ 97
            </button>
            
            <div className="space-y-3">
              <p className="text-2xl font-semibold">⚡ Acesso liberado em 2 minutos após o pagamento</p>
              <div className="flex items-center justify-center space-x-8 text-lg opacity-90">
                <span>🔒 Pagamento 100% seguro via Kiwify</span>
                <span>📱 Download imediato</span>
                <span>🛡️ Garantia total de 30 dias</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 max-w-4xl mx-auto">
            <p className="text-2xl font-bold">
              🔥 Mais de 500 pessoas compraram nas últimas 24h!
            </p>
            <p className="text-lg mt-2">
              Não fique de fora desta transformação. Sua vida financeira nunca mais será a mesma!
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Seção de acesso para quem já comprou - FIXO NO TOPO */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-sm">
              <span className="font-semibold">✅ Já comprou no Kiwify?</span> Acesse sua conta:
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="Digite seu email do Kiwify"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm h-9 w-full sm:w-64"
              />
              <button 
                onClick={handleVerifyAccess}
                disabled={verifying}
                className="h-9 px-4 whitespace-nowrap bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm transition-colors"
              >
                {verifying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Entrar
                  </>
                )}
              </button>
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

      {/* Navegação melhorada */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/40 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3">
        {/* Botão anterior */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white hover:bg-white/20 disabled:opacity-30 p-2 rounded-full transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Indicadores de slide melhorados */}
        <div className="flex space-x-2">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-3 w-3 rounded-full transition-all ${
                i === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Botão próximo */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="text-white hover:bg-white/20 disabled:opacity-30 p-2 rounded-full transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Contador de slides */}
      <div className="fixed top-20 md:top-24 right-4 md:right-8 bg-black/40 backdrop-blur-sm rounded-full px-3 md:px-4 py-1 md:py-2 text-white text-sm md:text-base">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Botão flutuante de compra */}
      {currentSlide >= 5 && (
        <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8">
          <button
            onClick={handleKiwifyCheckout}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all animate-pulse"
          >
            💰 Comprar R$ 97
          </button>
        </div>
      )}
    </div>
  );
};

export default ImprovedSalesSlides;