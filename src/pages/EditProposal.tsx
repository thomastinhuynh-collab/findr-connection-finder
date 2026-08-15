import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Euro, Tag, Sparkles, Save, ImagePlus, Loader2, Crown, Link as LinkIcon, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProposalData {
  id: string;
  title: string;
  description: string | null;
  proposed_price: number;
  image_urls: string[];
  product_link: string | null;
  status: string;
  search_id: string;
  findr_id: string;
}

interface SearchData {
  id: string;
  title: string;
  budget_min: number | null;
  budget_max: number | null;
  user_id: string;
}

interface UserProfile {
  is_premium: boolean | null;
}

const conditions = [
  { value: "neuf", label: "Neuf avec étiquette" },
  { value: "comme-neuf", label: "Comme neuf" },
  { value: "tres-bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "correct", label: "État correct" },
];

const EditProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [productLink, setProductLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isPremium = userProfile?.is_premium || false;
  const FINDR_FEE_RATE = 0.04;
  const priceNum = parseFloat(price) || 0;
  const findrFee = Math.round(priceNum * FINDR_FEE_RATE * 100) / 100;
  const finalAmount = Math.round((priceNum - findrFee) * 100) / 100;

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour modifier une proposition.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchProposal();
      fetchUserProfile();
    }
  }, [id, user]);

  const fetchProposal = async () => {
    const { data: proposalData, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (proposalError || !proposalData) {
      console.error("Error fetching proposal:", proposalError);
      setLoading(false);
      return;
    }

    // Check if user is the owner
    if (proposalData.findr_id !== user?.id) {
      toast({
        title: "Accès refusé",
        description: "Vous ne pouvez modifier que vos propres propositions.",
        variant: "destructive",
      });
      navigate("/mes-propositions");
      return;
    }

    // Check if proposal is still pending
    if (proposalData.status !== "pending") {
      toast({
        title: "Modification impossible",
        description: "Cette proposition ne peut plus être modifiée.",
        variant: "destructive",
      });
      navigate("/mes-propositions");
      return;
    }

    setProposal(proposalData);
    setExistingImageUrls(proposalData.image_urls || []);
    setPrice(proposalData.proposed_price.toString());
    setDescription(proposalData.description || "");
    setProductLink(proposalData.product_link || "");
    
    // Parse brand and condition from title if possible
    const titleParts = proposalData.title.split(" - ");
    if (titleParts.length >= 2) {
      setBrand(titleParts[0]);
      const conditionLabel = titleParts[1];
      const matchedCondition = conditions.find(c => c.label === conditionLabel);
      if (matchedCondition) {
        setCondition(matchedCondition.value);
      }
    }

    // Fetch search data
    const { data: searchData } = await supabase
      .from("searches")
      .select("id, title, budget_min, budget_max, user_id")
      .eq("id", proposalData.search_id)
      .maybeSingle();

    setSearch(searchData);
    setLoading(false);
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setUserProfile(data);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}-${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return "Non défini";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const totalImages = existingImageUrls.length + newImages.length;
      const newFiles = Array.from(files).slice(0, 4 - totalImages);
      setNewImages((prev) => [...prev, ...newFiles]);
      
      // Create preview URLs
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setNewImagePreviews((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of newImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${proposal?.search_id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('search-images')
        .upload(fileName, file);
      
      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('search-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalImages = existingImageUrls.length + newImages.length;
    if (totalImages === 0) {
      toast({
        title: "Photo requise",
        description: "Veuillez conserver ou ajouter au moins une photo.",
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

    if (!user || !proposal || !search) return;

    setIsSubmitting(true);
    
    try {
      // Upload new images
      const newUploadedUrls = await uploadImages();
      const allImageUrls = [...existingImageUrls, ...newUploadedUrls];
      
      // Update proposal
      const { error } = await supabase
        .from("proposals")
        .update({
          title: `${brand} - ${conditions.find(c => c.value === condition)?.label}`,
          description: description || null,
          proposed_price: parseFloat(price),
          image_urls: allImageUrls,
          product_link: productLink || null,
        })
        .eq("id", id);
      
      if (error) throw error;

      // Notify the search owner about the update
      await supabase
        .from("notifications")
        .insert({
          user_id: search.user_id,
          type: "proposal_updated",
          title: "Proposition mise à jour",
          message: `Un findr a mis à jour sa proposition pour "${search.title}"`,
          link: `/recherche/${search.id}`
        });
      
      toast({
        title: "Proposition mise à jour ! ✨",
        description: "Vos modifications ont été enregistrées.",
      });
      
      navigate(`/recherche/${proposal.search_id}`);
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la proposition. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  if (!proposal || !search) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Proposition non trouvée
            </h1>
            <Button onClick={() => navigate("/mes-propositions")}>
              Retour à mes propositions
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalImages = existingImageUrls.length + newImages.length;

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
              onClick={() => {
                const idx = (window.history.state as any)?.idx;
                if (typeof idx === "number" && idx > 0) navigate(-1);
                else navigate("/mes-propositions");
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>

            <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-2">
              Modifier ma proposition
            </h1>
            <p className="text-muted-foreground">
              Pour : <span className="text-foreground font-medium">{search.title}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Budget du buyr : <span className="text-accent font-medium">{formatBudget(search.budget_min, search.budget_max)}</span>
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
                {/* Existing images */}
                {existingImageUrls.map((img, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* New images */}
                {newImagePreviews.map((img, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-accent">
                    <img src={img} alt={`Nouvelle photo ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                      Nouveau
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {totalImages < 4 && (
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
                Vous pouvez avoir jusqu'à 4 photos. Des photos claires augmentent vos chances d'être sélectionné.
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
                  min="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Le budget du buyr est de {formatBudget(search.budget_min, search.budget_max)}
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

            {/* Product Link (optional) */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label htmlFor="productLink" className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                <LinkIcon className="w-5 h-5 text-accent" />
                Lien du produit (optionnel)
              </Label>
              <Input
                id="productLink"
                type="url"
                placeholder="https://..."
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ajoutez un lien vers l'annonce originale (Vinted, Leboncoin, etc.)
              </p>
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

            {/* Commission Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Euro className="w-5 h-5 text-accent" />
                Récapitulatif des gains
                {isPremium && (
                  <span className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </h3>

              {/* Fee Breakdown */}
              <div className="bg-card rounded-xl p-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix proposé</span>
                    <span className="font-medium">{priceNum.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Commission plateforme ({isPremium ? "0%" : "5%"})
                    </span>
                    <span className={`font-medium ${isPremium ? "text-success" : "text-destructive"}`}>
                      {isPremium ? "0.00 €" : `-${(priceNum * 0.05).toFixed(2)} €`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais d'authentification (3%)</span>
                    <span className="font-medium text-destructive">-{(priceNum * 0.03).toFixed(2)} €</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">Vous recevrez</span>
                    <span className="text-2xl font-bold text-success">{finalAmount.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Mettre à jour ma proposition
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProposal;
