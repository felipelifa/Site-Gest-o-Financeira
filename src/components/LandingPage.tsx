import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  TrendingUp, 
  PiggyBank, 
  Calendar, 
  Target, 
  BarChart3,
  CheckCircle,
  Star,
  Users,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetApp = () => {
    navigate('/checkout');
  };

  const features = [
    {
      icon: Smartphone,
      title: "Acesso Multiplataforma",
      description: "Use no seu celular, tablet ou computador."
    },
    {
      icon: TrendingUp,
      title: "Controle Financeiro",
      description: "Organize suas finanças de forma fácil e intuitiva."
    },
    {
      icon: PiggyBank,
      title: "Economize Dinheiro",
      description: "Descubra como economizar e investir seu dinheiro."
    },
    {
      icon: Calendar,
      title: "Planejamento",
      description: "Crie metas e planeje seu futuro financeiro."
    },
    {
      icon: Target,
      title: "Metas",
      description: "Defina metas financeiras e acompanhe seu progresso."
    },
    {
      icon: BarChart3,
      title: "Relatórios",
      description: "Visualize seus gastos e ganhos em relatórios detalhados."
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      text: "O DinDin Mágico me ajudou a organizar minhas finanças e economizar dinheiro. Recomendo!",
      stars: 5
    },
    {
      name: "João Santos",
      text: "Com o DinDin Mágico, finalmente consegui sair do vermelho e começar a investir. Muito obrigado!",
      stars: 4
    },
    {
      name: "Ana Paula",
      text: "O app é muito fácil de usar e me ajudou a ter uma visão clara das minhas finanças. Adorei!",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            DinDin Mágico 💰✨
          </a>
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-primary transition-colors">
                  Testemunhos
                </a>
              </li>
              <li>
                <Button onClick={handleGetApp} size="sm">
                  Começar Agora
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-bold text-primary mb-6">
              Controle suas Finanças de Forma Mágica!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Organize suas finanças, economize dinheiro e alcance seus objetivos
              com o DinDin Mágico.
            </p>
            <Button onClick={handleGetApp} size="lg" className="text-lg px-8 py-6">
              Começar Agora
            </Button>
          </div>
          <div>
            <img
              src="/hero-image.png"
              alt="DinDin Mágico"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Funcionalidades Incríveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-md hover:scale-105 transition-transform">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            O que Nossos Usuários Estão Dizendo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-md hover:scale-105 transition-transform">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {testimonial.name}
                    <div className="flex items-center">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    "{testimonial.text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - update the main button */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-8">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Transforme sua Vida Financeira Hoje!
              </CardTitle>
              <p className="text-xl text-muted-foreground mb-8">
                Acesso vitalício por apenas <span className="text-2xl font-bold text-accent">R$ 29,90</span>
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetApp}
                size="lg" 
                className="text-lg px-8 py-6"
                variant="magical"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCard className="mr-2 h-5 w-5" />
                )}
                Comprar Agora - R$ 29,90
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                ✅ Pagamento seguro • ✅ Download imediato • ✅ Sem mensalidades
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DinDin Mágico. Todos os direitos reservados.
          </p>
          <ul className="flex items-center space-x-4">
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos de Serviço
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
