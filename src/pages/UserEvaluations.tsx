import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Evaluation {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  from_profile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const UserEvaluations = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch evaluations
    const { data: evaluationsData } = await supabase
      .from("evaluations")
      .select("*")
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false });

    if (evaluationsData && evaluationsData.length > 0) {
      const fromUserIds = [...new Set(evaluationsData.map(e => e.from_user_id))];
      const { data: fromProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", fromUserIds);

      const profilesMap = new Map(fromProfiles?.map(p => [p.user_id, p]) || []);

      const evalsWithProfiles = evaluationsData.map(evaluation => ({
        ...evaluation,
        from_profile: profilesMap.get(evaluation.from_user_id) || null
      }));

      setEvaluations(evalsWithProfiles);

      const avg = evaluationsData.reduce((sum, e) => sum + e.rating, 0) / evaluationsData.length;
      setAverageRating(avg);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2">
              Évaluations de {profile?.full_name || "l'utilisateur"}
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? "text-accent fill-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-primary">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({evaluations.length} avis)</span>
            </div>
          </div>

          {/* Evaluations list */}
          {evaluations.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map((evaluation, index) => (
                <motion.div
                  key={evaluation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => navigate(`/profil/${evaluation.from_profile?.user_id}`)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={evaluation.from_profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {evaluation.from_profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => navigate(`/profil/${evaluation.from_profile?.user_id}`)}
                          className="font-medium text-primary hover:text-accent transition-colors"
                        >
                          {evaluation.from_profile?.full_name || "Utilisateur"}
                        </button>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < evaluation.rating
                                  ? "text-accent fill-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {evaluation.comment && (
                        <p className="text-muted-foreground leading-relaxed">
                          "{evaluation.comment}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        {formatDate(evaluation.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default UserEvaluations;
