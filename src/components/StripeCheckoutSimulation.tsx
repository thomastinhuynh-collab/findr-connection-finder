import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Lock, Crown, Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutSimulationProps {
  plan: "monthly" | "annual";
  onClose: () => void;
  onSuccess: () => void;
}

const StripeCheckoutSimulation = ({ plan, onClose, onSuccess }: StripeCheckoutSimulationProps) => {
  const [step, setStep] = useState<"payment" | "processing" | "success">("payment");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const price = plan === "monthly" ? "15,00 €" : "100,00 €";
  const planName = plan === "monthly" ? "Mensuel" : "Annuel";

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiry || !cvc || !name) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setStep("processing");

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setStep("success");
    
    // Wait a bit before calling onSuccess
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (step === "processing") {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <CreditCard className="absolute inset-0 m-auto w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Traitement en cours...</h2>
            <p className="text-muted-foreground">Veuillez patienter pendant que nous traitons votre paiement</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-success/30 bg-success/5">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Paiement réussi !</h2>
            <p className="text-muted-foreground mb-4">
              Bienvenue dans la communauté Findr Premium !
            </p>
            <Badge className="bg-primary text-primary-foreground">
              <Crown className="w-3 h-3 mr-1" />
              Abonnement {planName} activé
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-8">
      <Card className="w-full max-w-lg mx-4 border-primary/20">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="w-4 h-4 text-success" />
                Paiement sécurisé
              </CardTitle>
              <CardDescription>Simulation Stripe - Mode test</CardDescription>
            </div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
              alt="Stripe" 
              className="h-8 opacity-60"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Abonnement Premium {planName}</span>
              <Badge variant="outline">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{price}</span>
            </div>
            {plan === "monthly" && (
              <p className="text-xs text-muted-foreground mt-2">Renouvelé automatiquement chaque mois</p>
            )}
            {plan === "annual" && (
              <p className="text-xs text-muted-foreground mt-2">Économisez 80€ par rapport au mensuel</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom sur la carte</Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card">Numéro de carte</Label>
              <div className="relative">
                <Input
                  id="card"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="bg-background pl-10"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Utilisez 4242 4242 4242 4242 pour tester
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Date d'expiration</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").substring(0, 3))}
                  maxLength={3}
                  className="bg-background"
                />
              </div>
            </div>

            <Button type="submit" className="w-full btn-hero" size="lg">
              <Lock className="w-4 h-4 mr-2" />
              Payer {price}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="w-3 h-3" />
              Visa, Mastercard, Amex
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeCheckoutSimulation;
