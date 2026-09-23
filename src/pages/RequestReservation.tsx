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
import TranslatedContent from "@/components/TranslatedContent";
import { useTranslation } from "react-i18next";

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
  description: string | null;
  source_lang: string;
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
  const { t } = useTranslation();
  const [search, setSearch] = useState<SearchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReservation, setExistingReservation] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);


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
      .select("id, title, user_id, image_url, description, source_lang")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
          title: t("common.error"),
          description: t("reservation.searchNotFound"),
        variant: "destructive",
      });
      navigate("/recherches");
      return;
    }

    // Cannot reserve own search
    if (data.user_id === user?.id) {
      toast({
          title: t("reservation.actionImpossible"),
          description: t("reservation.ownSearch"),
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
      return;
    }

    // Limite : 3 réservations actives simultanées maximum
    const { count: activeCount } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("findr_id", user.id)
      .in("status", ["pending", "approved"]);

    if ((activeCount ?? 0) >= MAX_ACTIVE_RESERVATIONS) {
      setBlockReason(
        `Tu as déjà ${MAX_ACTIVE_RESERVATIONS} réservations actives. Termine ou laisse expirer l'une d'elles avant d'en demander une nouvelle.`,
      );
      return;
    }

    // Blocage 7 jours après 3 réservations expirées sans proposition
    const since = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { count: expiredCount } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("findr_id", user.id)
      .eq("expired_without_proposal", true)
      .gte("updated_at", since);

    if ((expiredCount ?? 0) >= 3) {
      setBlockReason(
        `Trois de tes réservations ont expiré sans proposition. Pour préserver la disponibilité des recherches, tu ne peux pas réserver pendant ${COOLDOWN_DAYS} jours.`,
      );
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
      await supabase.rpc("create_notification", {
        _user_id: search.user_id,
        _type: "reservation_request",
        _title: "Demande de réservation",
        _message: `Un findr souhaite réserver ton annonce "${search.title}" pendant ${formData.duration} jours.`,
        _link: `/recherche/${search.id}`,
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

  if (existingReservation || blockReason) {
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
                       {blockReason ? t("reservation.impossible") : t("reservation.alreadyExists")}
                    </h2>
                    <p className="text-muted-foreground">
                      {blockReason ??
                         t("reservation.alreadyPending")}
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-6 w-full"
                  onClick={() => navigate(`/recherche/${id}`)}
                >
                   {t("reservation.backToSearch")}
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
                 {t("reservation.requestTitle")}
              </h1>
              <p className="text-muted-foreground mt-2">
                 {t("reservation.requestSubtitle")}
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
                       <TranslatedContent type="search" id={search.id} title={search.title} description={search.description} sourceLang={search.source_lang}>
                         {({ title }) => <h3 className="font-semibold text-primary line-clamp-1">{title}</h3>}
                       </TranslatedContent>
                      <p className="text-sm text-muted-foreground">
                         {t("reservation.searchToBook")}
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
                   {t("reservation.justifyTitle")}
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
                       {t("reservation.duration")}
                    </Label>
                    <Select
                      value={selectedDuration}
                      onValueChange={(value) => setValue("duration", value)}
                    >
                      <SelectTrigger>
                         <SelectValue placeholder={t("reservation.selectDuration")} />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                           {t("reservation.sevenDaysRenewable")}
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
                       {t("reservation.why")}
                    </Label>
                    <Textarea
                      id="justification"
                       placeholder={t("reservation.justificationPlaceholder")}
                      className="min-h-[150px] resize-none"
                      {...register("justification")}
                    />
                    {errors.justification && (
                      <p className="text-sm text-destructive">
                        {errors.justification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
                       {t("reservation.characters", { count: watch("justification")?.length || 0 })}
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                    <h4 className="font-medium text-accent mb-2">
                       {t("reservation.howItWorks")}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                       <li>• {t("reservation.step1")}</li>
                       <li>• {t("reservation.step2")}</li>
                      <li>
                         • {t("reservation.step3")}
                      </li>
                       <li>• {t("reservation.step4")}</li>
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
                       {t("common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                           {t("reservation.sending")}
                        </>
                      ) : (
                        <>
                          <CalendarClock className="w-4 h-4 mr-2" />
                           {t("reservation.send")}
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
