import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Euro, Clock, MapPin, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Mode Vintage",
  "Pop Culture & TCG",
  "Vinyles & Musique",
  "Photo & Électronique",
  "Bijoux & Accessoires",
  "Déco & Mobilier",
  "Autre",
];

const PostSearch = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Recherche publiée ! 🎉",
      description: "Les Findrs vont se mettre en quête de ta pépite.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Poste ta recherche
            </h1>
            <p className="text-muted-foreground">
              Décris l'objet de tes rêves et laisse la communauté le trouver pour toi
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-vintage space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Qu'est-ce que tu cherches ? *</Label>
              <Input
                id="title"
                placeholder="Ex: Veste en cuir oversize années 80"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée</Label>
              <Textarea
                id="description"
                placeholder="Décris l'état souhaité, les détails importants, les inspirations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionne une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photos d'inspiration</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Glisse tes images ici ou clique pour télécharger
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG jusqu'à 5MB
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label>Budget</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    className="h-12 pl-10"
                  />
                </div>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Deadline & Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Délai souhaité</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Select 
                    value={formData.deadline}
                    onValueChange={(value) => setFormData({ ...formData, deadline: value })}
                  >
                    <SelectTrigger className="h-12 pl-10">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="3-days">3 jours</SelectItem>
                      <SelectItem value="1-week">1 semaine</SelectItem>
                      <SelectItem value="2-weeks">2 semaines</SelectItem>
                      <SelectItem value="1-month">1 mois</SelectItem>
                      <SelectItem value="no-rush">Pas pressé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ville"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full btn-hero h-14 text-base">
              Publier ma recherche
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              En publiant, tu acceptes nos CGU et notre politique de confidentialité.
            </p>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostSearch;
