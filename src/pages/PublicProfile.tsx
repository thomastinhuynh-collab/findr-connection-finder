import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Crown, Award, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_findr: boolean | null;
  is_premium: boolean | null;
  xp_points: number | null;
  level: number | null;
  created_at: string;
}

interface SearchItem {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string | null;
  image_url: string | null;
  created_at: string;
}

interface Evaluation {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  from_profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("app_settings")
        .select("gamification_enabled")
        .maybeSingle();
      if (data) setGamificationEnabled(!!data.gamification_enabled);
    })();
  }, [userId]);

  const fetchProfileData = async () => {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Fetch user's searches
    const { data: searchesData } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (searchesData) {
      setSearches(searchesData);
    }

    // Fetch evaluations received by this user
    const { data: evaluationsData } = await supabase
      .from("evaluations")
      .select("*")
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false });

    if (evaluationsData && evaluationsData.length > 0) {
      // Fetch profiles of evaluators
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

      // Calculate average rating
      const avg = evaluationsData.reduce((sum, e) => sum + e.rating, 0) / evaluationsData.length;
      setAverageRating(avg);
    }

    setLoading(false);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}-${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return "Non défini";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const getLevelBadge = (level: number | null) => {
    const levels: Record<number, { name: string; color: string }> = {
      1: { name: "Débutant", color: "bg-gray-500" },
      2: { name: "Apprenti", color: "bg-green-500" },
      3: { name: "Confirmé", color: "bg-blue-500" },
      4: { name: "Expert", color: "bg-purple-500" },
      5: { name: "Maître", color: "bg-amber-500" },
      6: { name: "Légende", color: "bg-gradient-to-r from-amber-500 to-red-500" },
    };
    return levels[level || 1] || levels[1];
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Profil introuvable</h1>
          <Button onClick={() => {
            const idx = (window.history.state as any)?.idx;
            if (typeof idx === "number" && idx > 0) navigate(-1);
            else navigate("/");
          }}>Retour</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const levelInfo = getLevelBadge(profile.level);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => {
            const idx = (window.history.state as any)?.idx;
            if (typeof idx === "number" && idx > 0) navigate(-1);
            else navigate("/");
          }}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Profile info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              {/* Avatar & Name */}
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-accent">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profile.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  {profile.full_name || "Utilisateur"}
                  {profile.is_premium && <Crown className="w-5 h-5 text-accent" />}
                </h1>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {gamificationEnabled && (
                    <Badge className={`${levelInfo.color} text-white`}>
                      Niveau {profile.level} - {levelInfo.name}
                    </Badge>
                  )}
                  {profile.is_findr && (
                    <Badge variant="outline" className="border-accent text-accent">
                      <Award className="w-3 h-3 mr-1" />
                      findr
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className={`grid ${gamificationEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-4 py-4 border-y border-border mb-4`}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{searches.length}</p>
                  <p className="text-xs text-muted-foreground">Recherches</p>
                </div>
                <button
                  onClick={() => navigate(`/profil/${userId}/evaluations`)}
                  className="text-center hover:bg-secondary/50 rounded-lg transition-colors py-1 -my-1"
                >
                  <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    {averageRating.toFixed(1)}
                    <Star className="w-4 h-4 text-accent fill-accent" />
                  </p>
                  <p className="text-xs text-muted-foreground">Note ({evaluations.length})</p>
                </button>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.xp_points || 0}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-4">
                  <h3 className="font-medium text-primary mb-2">À propos</h3>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Member since */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Membre depuis {formatDate(profile.created_at)}
              </div>
            </div>
          </motion.div>

          {/* Right column - Searches only */}
          <div className="lg:col-span-2">
            {/* Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recherches de {profile.full_name?.split(" ")[0] || "cet utilisateur"}
              </h2>
              
              {searches.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-muted-foreground">Aucune recherche publiée</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {searches.map((search) => (
                    <div
                      key={search.id}
                      onClick={() => navigate(`/recherche/${search.id}`)}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="h-32 bg-secondary overflow-hidden">
                        {search.image_url ? (
                          <img
                            src={search.image_url}
                            alt={search.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">🔍</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={search.status === "active" ? "default" : "secondary"}>
                            {search.status === "active" ? "Active" : "Terminée"}
                          </Badge>
                          <Badge variant="outline">{search.category}</Badge>
                        </div>
                        <h3 className="font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {search.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatBudget(search.budget_min, search.budget_max)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProfile;
