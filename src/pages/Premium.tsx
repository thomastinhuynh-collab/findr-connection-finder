import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Search, Bell, Zap, Shield, Star, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StripeCheckoutSimulation from "@/components/StripeCheckoutSimulation";
import { toast } from "sonner";

const Premium = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");

  const handleSelectPlan = (plan: "monthly" | "annual") => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    toast.success("Félicitations ! Vous êtes maintenant Premium !");
  };

  // Le programme Premium est volontairement mis de côté pour le lancement.
  // Le code existant est conservé ; on affiche un message temporaire.
  const premiumEnabled = false;
  if (!premiumEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Bientôt disponible
            </h1>
            <p className="text-muted-foreground">
              Le programme Premium est temporairement mis de côté pour le lancement.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  const findrBenefits = [
    {
      icon: Star,
      title: "Mise en avant des propositions",
      description: "Vos propositions apparaissent en priorité auprès des buyrs"
    },
    {
      icon: Bell,
      title: "Alertes ciblées",
      description: "Recevez des notifications instantanées pour les recherches correspondant à vos spécialités"
    },
    {
      icon: Zap,
      title: "Auto-scraping Vinted/LBC",
      description: "Outils automatisés pour trouver les meilleures affaires sur les plateformes populaires"
    },
    {
      icon: Crown,
      title: "0% de frais de plateforme",
      description: "Gardez 100% de votre marge ! Seuls les 3% de frais d'authentification restent"
    }
  ];

  const buyerBenefits = [
    {
      icon: Star,
      title: "Priorité sur vos demandes",
      description: "Vos recherches sont traitées en priorité par notre communauté de findrs"
    },
    {
      icon: Headphones,
      title: "Assistance VIP",
      description: "Un support dédié pour répondre à toutes vos questions rapidement"
    },
    {
      icon: Shield,
      title: "Vérification qualité",
      description: "Un expert vérifie la qualité de chaque article avant livraison"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Passez à la vitesse supérieure
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Débloquez des fonctionnalités exclusives et maximisez vos chances de trouver 
            ou de vendre les objets rares que vous recherchez.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <Card className="relative border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Mensuel</CardTitle>
                <CardDescription>Flexibilité maximale</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">15€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <Button className="w-full btn-hero" size="lg" onClick={() => handleSelectPlan("monthly")}>
                  Commencer maintenant
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Sans engagement, annulez à tout moment
                </p>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card className="relative border-2 border-primary shadow-lg shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">
                  Économisez 80€
                </Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Annuel</CardTitle>
                <CardDescription>Meilleure valeur</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">100€</span>
                  <span className="text-muted-foreground">/an</span>
                </div>
                <Button className="w-full btn-gold" size="lg" onClick={() => handleSelectPlan("annual")}>
                  Économiser avec l'annuel
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Soit ~8,33€/mois, facturé annuellement
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits for Findrs */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Search className="w-3 h-3 mr-1" />
              Pour les findrs
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Boostez vos performances de findr
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Des outils puissants pour trouver plus vite et gagner plus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {findrBenefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits for Buyers */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Crown className="w-3 h-3 mr-1" />
              Pour les buyrs
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Une expérience d'achat privilégiée
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Bénéficiez d'un service exclusif et de garanties premium
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {buyerBenefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 max-w-3xl mx-auto">
            <CardContent className="text-center py-12">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Prêt à passer Premium ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Rejoignez des centaines d'utilisateurs qui profitent déjà des avantages Premium.
              </p>
              <Button size="lg" className="btn-gold" onClick={() => handleSelectPlan("annual")}>
                <Crown className="w-4 h-4 mr-2" />
                Devenir Premium
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />

      {/* Stripe Checkout Simulation */}
      {showCheckout && (
        <StripeCheckoutSimulation
          plan={selectedPlan}
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Premium;
