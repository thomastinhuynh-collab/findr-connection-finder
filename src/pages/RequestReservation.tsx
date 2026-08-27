import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarClock, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const reservationSchema = z.object({
  justification: z
    .string()
    .min(20, "La justification doit contenir au moins 20 caractères")
    .max(500, "La justification ne peut pas dépasser 500 caractères"),
  duration: z.string().min(1, "Veuillez sélectionner une durée"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface SearchInfo {
  id: string;
  title: string;
  user_id: string;
  image_url: string | null;
}

// Durée unique : 7 jours, renouvelable une fois (14 jours maximum au total)
const durationOptions = [{ value: "7", label: "7 jours (renouvelable une fois)" }];

const MAX_ACTIVE_RESERVATIONS = 3;
const COOLDOWN_DAYS = 7;


const RequestReservation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState<SearchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReservation, setExistingReservation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      justification: "",
      duration: "7",
    },
  });

  const selectedDuration = watch("duration");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (id) {
      fetchSearch();
      checkExistingReservation();
    }
  }, [id, user]);

  const fetchSearch = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select("id, title, user_id, image_url")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Annonce non trouvée.",
        variant: "destructive",
      });
      navigate("/recherches");
      return;
    }

    // Cannot reserve own search
    if (data.user_id === user?.id) {
      toast({
        title: "Action impossible",
        description: "Tu ne peux pas réserver ta propre annonce.",
        variant: "destructive",
      });
      navigate(`/recherche/${id}`);
      return;
    }

    setSearch(data);
    setLoading(false);
  };

  const checkExistingReservation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("reservations")
      .select("id")
      .eq("search_id", id)
      .eq("findr_id", user.id)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (data) {
      setExistingReservation(true);
    }
  };

  const onSubmit = async (formData: ReservationFormData) => {
    if (!user || !search) return;

    setSubmitting(true);

    try {
      // Create reservation
      const { error: reservationError } = await supabase
        .from("reservations")
        .insert({
          search_id: search.id,
          findr_id: user.id,
          buyr_id: search.user_id,
          justification: formData.justification.trim(),
          requested_duration_days: parseInt(formData.duration),
          status: "pending",
        });

      if (reservationError) {
        throw reservationError;
      }

      // Send notification to Buyr
      await supabase.from("notifications").insert({
        user_id: search.user_id,
        type: "reservation_request",
        title: "Demande de réservation",
        message: `Un findr souhaite réserver ton annonce "${search.title}" pendant ${formData.duration} jours.`,
        link: `/recherche/${search.id}`,
      });

      toast({
        title: "Demande envoyée !",
        description: "Le buyr va examiner ta demande de réservation.",
      });

      navigate(`/recherche/${id}`);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Réessaie plus tard.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (existingReservation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <h2 className="text-lg font-semibold text-primary">
                      Réservation déjà existante
                    </h2>
                    <p className="text-muted-foreground">
                      Tu as déjà une demande de réservation en cours pour cette
                      annonce.
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => navigate(`/recherche/${id}`)}
                >
                  Retour à l'annonce
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4">
                <CalendarClock className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Demander une réservation
              </h1>
              <p className="text-muted-foreground mt-2">
                Réserve cette annonce pour toi seul pendant une durée limitée
              </p>
            </div>

            {/* Search Preview */}
            {search && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {search.image_url ? (
                      <img
                        src={search.image_url}
                        alt={search.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-primary line-clamp-1">
                        {search.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Annonce à réserver
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Justifie ta demande de réservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Duration Select */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-accent" />
                      Durée de réservation souhaitée
                    </Label>
                    <Select
                      value={selectedDuration}
                      onValueChange={(value) => setValue("duration", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.duration && (
                      <p className="text-sm text-destructive">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  {/* Justification */}
                  <div className="space-y-2">
                    <Label htmlFor="justification">
                      Pourquoi veux-tu réserver cette annonce ?
                    </Label>
                    <Textarea
                      id="justification"
                      placeholder="Explique au buyr pourquoi tu souhaites réserver cette annonce. Par exemple : tu as repéré l'article parfait et tu as besoin de temps pour finaliser la transaction..."
                      className="min-h-[150px] resize-none"
                      {...register("justification")}
                    />
                    {errors.justification && (
                      <p className="text-sm text-destructive">
                        {errors.justification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                      {watch("justification")?.length || 0}/500 caractères
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                    <h4 className="font-medium text-accent mb-2">
                      Comment ça marche ?
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Le buyr recevra ta demande de réservation</li>
                      <li>• Il peut accepter, refuser ou ajuster la durée</li>
                      <li>
                        • Si acceptée, l'annonce sera masquée aux autres findrs
                      </li>
                      <li>• Tu seras le seul à pouvoir interagir avec le buyr</li>
                    </ul>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/recherche/${id}`)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Envoyer la demande
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestReservation;
