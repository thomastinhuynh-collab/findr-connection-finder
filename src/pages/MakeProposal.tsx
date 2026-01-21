import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Euro, Tag, Sparkles, Send, ImagePlus, Loader2, Wallet, CreditCard, Shield, CheckCircle2, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface SearchData {
  id: string;
  title: string;
  budget_min: number | null;
  budget_max: number | null;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const conditions = [
  { value: "neuf", label: "Neuf avec étiquette" },
  { value: "comme-neuf", label: "Comme neuf" },
  { value: "tres-bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "correct", label: "État correct" },
];

const MakeProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour faire une proposition.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchSearch();
    }
  }, [id, user]);

  const fetchSearch = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select(`
        id, title, budget_min, budget_max, user_id,
        profiles!searches_user_id_fkey(full_name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching search:", error);
    } else {
      setSearch(data as any);
    }
    setLoading(false);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}-${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return "Non défini";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Recherche non trouvée
            </h1>
            <Button onClick={() => navigate("/recherches")}>
              Retour aux recherches
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast({
        title: "Photo requise",
        description: "Veuillez ajouter au moins une photo de votre trouvaille.",
        variant: "destructive",
      });
      return;
    }

    if (!price || !brand || !condition) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Proposition envoyée ! 🎉",
      description: `Votre proposition a été envoyée à ${search.profiles?.full_name || "l'utilisateur"}. Vous serez notifié de sa réponse.`,
    });
    
    setIsSubmitting(false);
    navigate(`/recherche/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>

            <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">
              Faire une proposition
            </h1>
            <p className="text-muted-foreground">
              Pour : <span className="text-foreground font-medium">{search.title}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Budget du Buyr : <span className="text-accent font-medium">{formatBudget(search.budget_min, search.budget_max)}</span>
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Photo Upload */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <ImagePlus className="w-5 h-5 text-accent" />
                Photos de l'objet *
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 4 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent">
                    <Upload className="w-8 h-8" />
                    <span className="text-xs text-center px-2">Ajouter une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Ajoutez jusqu'à 4 photos de votre trouvaille. Des photos claires augmentent vos chances d'être sélectionné.
              </p>
            </div>

            {/* Price */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label htmlFor="price" className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <Euro className="w-5 h-5 text-accent" />
                Prix proposé *
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 120"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pr-8 text-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Le budget du Buyr est de {formatBudget(search.budget_min, search.budget_max)}
              </p>
            </div>

            {/* Brand */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label htmlFor="brand" className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-accent" />
                Marque *
              </Label>
              <Input
                id="brand"
                type="text"
                placeholder="Ex: Levi's, Schott, Sans marque..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* Condition */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                État de l'objet *
              </Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez l'état" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description (optional) */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label htmlFor="description" className="text-lg font-semibold text-primary mb-4 block">
                Description complémentaire
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre trouvaille, son histoire, ses particularités..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Payment & Wallet Section */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-accent" />
                  Portefeuille & Paiement
                </h3>
                <Badge variant="outline" className="text-accent border-accent">
                  Simulation
                </Badge>
              </div>

              {/* Wallet Balance */}
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Solde disponible</p>
                      <p className="text-2xl font-bold">125.50 €</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/20 text-accent-foreground px-2 py-1 rounded-full text-xs">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Info */}
              <div className="bg-card rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-sm text-primary">Récapitulatif des frais</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix proposé</span>
                    <span className="font-medium">{price || "0"} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission plateforme (5%)</span>
                    <span className="font-medium text-destructive">-{(parseFloat(price || "0") * 0.05).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais d'authentification (3%)</span>
                    <span className="font-medium text-destructive">-{(parseFloat(price || "0") * 0.03).toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-primary">Vous recevrez</span>
                    <span className="font-bold text-accent">{(parseFloat(price || "0") * 0.92).toFixed(2)} €</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span>Avec <span className="font-medium text-accent">Premium</span>, économisez 5% de commission !</span>
                </div>
              </div>

              {/* Stripe Simulation Preview */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#635BFF] to-[#A259FF] flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Paiement sécurisé Stripe</p>
                    <p className="text-xs text-muted-foreground">Le Buyr paiera via Stripe</p>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs">Fonds sécurisés jusqu'à livraison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs">Authentification incluse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-xs">Protection acheteur & vendeur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full"
                    />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer ma proposition
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                En envoyant votre proposition, vous vous engagez à fournir l'objet au prix indiqué si le Buyr accepte.
              </p>
            </motion.div>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MakeProposal;
