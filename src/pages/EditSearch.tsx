import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro, Clock, MapPin, ArrowRight, Image as ImageIcon, X, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { splitBySize, oversizedDescription } from "@/lib/fileValidation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CATEGORIES, OTHER_CATEGORY } from "@/lib/categories";

const categories = [...CATEGORIES, { name: OTHER_CATEGORY, slug: OTHER_CATEGORY, status: "active" as const, subcategories: [] }];

const EditSearch = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "no-rush",
    status: "active",
  });

  useEffect(() => {
    if (!authLoading && !user) {
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
      .select("*")
      .eq("id", id)
      .eq("user_id", user?.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Cette recherche n'existe pas ou ne t'appartient pas.",
        variant: "destructive",
      });
      navigate("/mon-espace");
      return;
    }

    const urgency = data.urgency || "no-rush";
    setFormData({
      title: data.title,
      description: data.description || "",
      category: data.category,
      budgetMin: data.budget_min?.toString() || "",
      budgetMax: data.budget_max?.toString() || "",
      deadline: urgency,
      status: data.status || "active",
    });
    setDeadlineOpen(urgency !== "no-rush");
    setExistingImageUrl(data.image_url);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const { valid: files, oversized } = splitBySize(selected);
    if (oversized.length > 0) {
      toast({
        title: "Image trop lourde",
        description: oversizedDescription(oversized),
        variant: "destructive",
      });
    }
    if (files.length === 0) return;
    if (files.length + images.length > 5) {
      toast({
        title: "Trop d'images",
        description: "Tu peux ajouter maximum 5 images.",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);
    setExistingImageUrl(null);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = () => {
    setExistingImageUrl(null);
  };

  const uploadImages = async (): Promise<string | null> => {
    if (images.length === 0 || !user) return existingImageUrl;

    const file = images[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("search-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return existingImageUrl;
    }

    const { data: publicUrl } = supabase.storage
      .from("search-images")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour modifier une recherche.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.category) {
      toast({
        title: "Champs requis",
        description: "Le titre et la catégorie sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImages();

      const { error } = await supabase
        .from("searches")
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
          budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
          urgency: formData.deadline || "normal",
          image_url: imageUrl,
          status: formData.status,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Recherche modifiée ! ✓",
        description: "Tes modifications ont été enregistrées.",
      });

      navigate("/mon-espace");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("searches")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Recherche supprimée",
        description: "Ta recherche a été supprimée.",
      });

      navigate("/mon-espace");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

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
              Modifier ma recherche
            </h1>
            <p className="text-muted-foreground">
              Mets à jour les détails de ta recherche
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
                    <SelectItem
                      key={cat.slug}
                      value={cat.slug}
                      disabled={cat.status === "coming_soon"}
                      className={cat.status === "coming_soon" ? "opacity-50" : ""}
                    >
                      {cat.name}{cat.status === "coming_soon" ? " (bientôt disponible)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionne un statut" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photos d'inspiration</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              
              {existingImageUrl ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={existingImageUrl}
                      alt="Image actuelle"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeExistingImage}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-accent transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              ) : imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-accent transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique pour télécharger tes images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG jusqu'à 5MB - Max 5 images
                  </p>
                </div>
              )}
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

            {/* Deadline */}
            <div className="space-y-2">
              <Label>Délai souhaité</Label>
              {!deadlineOpen ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Pas de délai particulier — à ton rythme</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeadlineOpen(true)}
                    className="text-sm text-primary hover:underline underline-offset-2 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    + Ajouter une échéance souhaitée
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Select 
                      value={formData.deadline}
                      onValueChange={(value) => {
                        if (value === "no-rush") {
                          setDeadlineOpen(false);
                        }
                        setFormData({ ...formData, deadline: value });
                      }}
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
                  <button
                    type="button"
                    onClick={() => {
                      setDeadlineOpen(false);
                      setFormData({ ...formData, deadline: "no-rush" });
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Replier
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                size="lg" 
                className="flex-1 btn-hero h-14 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    Enregistrer les modifications
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="lg" 
                    className="h-14"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette recherche ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Ta recherche et toutes les propositions associées seront supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Supprimer"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditSearch;
