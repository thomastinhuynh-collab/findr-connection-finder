import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro, Clock, MapPin, ArrowRight, ArrowLeft, Image as ImageIcon, X, Loader2, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { splitBySize, oversizedDescription } from "@/lib/fileValidation";
import { CATEGORIES, OTHER_CATEGORY } from "@/lib/categories";

const categories = [...CATEGORIES, { name: OTHER_CATEGORY, slug: OTHER_CATEGORY, status: "active" as const, subcategories: [] }];

const conditionOptions = [
  "Neuf / Jamais utilisé",
  "Très bon état",
  "Bon état",
  "Usures acceptées",
];

const stepLabels = ["L'essentiel", "Les détails", "Les conditions"];

const PostSearch = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "no-rush",
    location: "",
  });

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

  const uploadImages = async (): Promise<string | null> => {
    if (images.length === 0 || !user) return null;
    const file = images[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("search-images")
      .upload(fileName, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: publicUrl } = supabase.storage
      .from("search-images")
      .getPublicUrl(data.path);
    return publicUrl.publicUrl;
  };

  // Validation per step
  const isStep1Valid = formData.title.trim() !== "" && formData.category !== "" && formData.condition !== "";
  const budgetMinNum = formData.budgetMin ? parseInt(formData.budgetMin) : null;
  const budgetMaxNum = formData.budgetMax ? parseInt(formData.budgetMax) : null;
  const budgetError =
    budgetMinNum !== null && budgetMaxNum !== null && budgetMinNum >= budgetMaxNum;

  const goNext = () => setCurrentStep((s) => Math.min(3, s + 1));
  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour poster une recherche.",
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
    if (budgetError) return;

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImages();
      const descriptionWithCondition = formData.condition
        ? `[État souhaité : ${formData.condition}]${formData.description ? "\n\n" + formData.description : ""}`
        : formData.description || null;

      const { error } = await supabase.from("searches").insert({
        user_id: user.id,
        title: formData.title,
        description: descriptionWithCondition,
        category: formData.category,
        budget_min: budgetMinNum,
        budget_max: budgetMaxNum,
        urgency: formData.deadline || "no-rush",
        image_url: imageUrl,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Recherche publiée ! 🎉",
        description: "Les findrs vont se mettre en quête de ta pépite.",
      });

      navigate("/mon-espace");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Poste ta recherche
            </h1>
            <p className="text-muted-foreground">
              Décris l'objet de tes rêves et laisse la communauté le trouver pour toi
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-start justify-between max-w-md mx-auto">
              {stepLabels.map((label, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center" style={{ minWidth: "70px" }}>
                      <div
                        className="flex items-center justify-center rounded-full transition-all"
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: isCompleted ? "#C9A84C" : isActive ? "#1B2A4A" : "transparent",
                          border: `2px solid ${isCompleted ? "#C9A84C" : isActive ? "#1B2A4A" : "#D4CCBC"}`,
                          color: isCompleted ? "#1B2A4A" : isActive ? "#FFFFFF" : "#9A8F84",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : stepNum}
                      </div>
                      <span
                        className="mt-2 text-center"
                        style={{ fontSize: "11px", color: "#6B6259", whiteSpace: "nowrap" }}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < stepLabels.length - 1 && (
                      <div
                        className="flex-1 mx-1 mt-[17px] self-start"
                        style={{
                          height: "2px",
                          backgroundColor: stepNum < currentStep ? "#C9A84C" : "#D4CCBC",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="post-search-form"
          >
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="title">Qu'est-ce que tu cherches ? <span className="required-mark">*</span></Label>
                    <Input
                      id="title"
                      placeholder="Ex: Veste en cuir oversize années 80"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-12"
                      required
                    />
                    <p style={{ fontSize: "11px", color: "#9A8F84", marginTop: "4px" }}>
                      Sois précis : marque, modèle, époque, taille si pertinent.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Catégorie <span className="required-mark">*</span></Label>
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

                  <div className="space-y-2">
                    <Label>État souhaité <span className="required-mark">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      {conditionOptions.map((opt) => {
                        const selected = formData.condition === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setFormData({ ...formData, condition: opt })}
                            className="text-left transition-all"
                            style={{
                              backgroundColor: selected ? "#1B2A4A" : "#FFFFFF",
                              border: `1.5px solid ${selected ? "#1B2A4A" : "#E8E2D9"}`,
                              color: selected ? "#FFFFFF" : "#1B2A4A",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={!isStep1Valid}
                    className="w-full text-white"
                    style={{
                      backgroundColor: "#1B2A4A",
                      height: "50px",
                      borderRadius: "10px",
                      opacity: isStep1Valid ? 1 : 0.4,
                    }}
                  >
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        placeholder="Décris l'état souhaité, les détails importants, les inspirations..."
                        value={formData.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setFormData({ ...formData, description: e.target.value });
                          }
                        }}
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                      />
                      <div
                        className="absolute bottom-2 right-3 pointer-events-none"
                        style={{ fontSize: "11px", color: "#9A8F84" }}
                      >
                        {formData.description.length} / 500
                      </div>
                    </div>
                  </div>

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

                    {imagePreviews.length > 0 ? (
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
                            className="aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            style={{
                              border: "2px dashed #C9A84C",
                              backgroundColor: "#FDFAF5",
                            }}
                          >
                            <ImageIcon className="w-6 h-6" style={{ color: "#C9A84C" }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl p-8 text-center cursor-pointer transition-colors"
                        style={{
                          border: "2px dashed #C9A84C",
                          backgroundColor: "#FDFAF5",
                        }}
                      >
                        <div
                          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: "#FFFFFF" }}
                        >
                          <ImageIcon className="w-7 h-7" style={{ color: "#C9A84C" }} />
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#1B2A4A", marginBottom: "4px" }}>
                          Ajoute des photos d'inspiration
                        </p>
                        <p style={{ fontSize: "12px", color: "#9A8F84", marginBottom: "8px" }}>
                          Une image du produit que tu veux, une référence trouvée en ligne...
                        </p>
                        <p style={{ fontSize: "11px", color: "#B0A898" }}>
                          PNG, JPG jusqu'à 5MB · Max 5 images
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goPrev}
                      style={{
                        borderColor: "#1B2A4A",
                        color: "#1B2A4A",
                        height: "50px",
                        borderRadius: "10px",
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={goNext}
                      className="text-white"
                      style={{
                        backgroundColor: "#1B2A4A",
                        height: "50px",
                        borderRadius: "10px",
                      }}
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative input-with-icon">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#C9A84C" }} />
                        <Input
                          type="number"
                          placeholder="50€"
                          value={formData.budgetMin}
                          onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        />
                      </div>
                      <div className="relative input-with-icon">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#C9A84C" }} />
                        <Input
                          type="number"
                          placeholder="200€"
                          value={formData.budgetMax}
                          onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        />
                      </div>
                    </div>
                    {budgetError && (
                      <p style={{ color: "#DC2626", fontSize: "12px" }}>
                        Le budget minimum doit être inférieur au maximum.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Délai souhaité</Label>
                    {!deadlineOpen ? (
                      <div className="space-y-2">
                        <div
                          className="flex items-center gap-3"
                          style={{
                            backgroundColor: "#FDFAF5",
                            border: "1.5px solid #E8E2D9",
                            borderRadius: "8px",
                            padding: "12px 14px",
                          }}
                        >
                          <Clock className="w-4 h-4" style={{ color: "#C9A84C" }} />
                          <span style={{ fontSize: "14px", color: "#1B2A4A" }}>
                            Pas de délai particulier — à ton rythme
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeadlineOpen(true)}
                          style={{
                            fontSize: "13px",
                            color: "#1B2A4A",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          + Ajouter une échéance souhaitée
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative input-with-icon">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#C9A84C" }} />
                          <Select
                            value={formData.deadline}
                            onValueChange={(value) => {
                              if (value === "no-rush") {
                                setDeadlineOpen(false);
                              }
                              setFormData({ ...formData, deadline: value });
                            }}
                          >
                            <SelectTrigger>
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
                          style={{
                            fontSize: "13px",
                            color: "#9A8F84",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          Replier
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Localisation</Label>
                    <div className="relative input-with-icon">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "#C9A84C" }} />
                      <Input
                        placeholder="Ville"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Reassurance block */}
                  <div
                    className="flex items-start gap-3"
                    style={{
                      backgroundColor: "#F0F4FF",
                      border: "1px solid #C7D5F0",
                      borderRadius: "8px",
                      padding: "12px 16px",
                    }}
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1B2A4A" }} />
                    <p style={{ fontSize: "13px", color: "#1B2A4A", lineHeight: 1.6 }}>
                      Après publication, les membres findr reçoivent ta demande et te font des propositions sous 48h en moyenne.
                    </p>
                  </div>

                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goPrev}
                      disabled={isSubmitting}
                      style={{
                        borderColor: "#1B2A4A",
                        color: "#1B2A4A",
                        height: "52px",
                        borderRadius: "10px",
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || budgetError}
                      className="text-white"
                      style={{
                        backgroundColor: "#1B2A4A",
                        height: "52px",
                        padding: "0 28px",
                        borderRadius: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Publication...
                        </>
                      ) : (
                        <>
                          Publier ma recherche
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    En publiant, tu acceptes nos CGU et notre politique de confidentialité.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostSearch;
