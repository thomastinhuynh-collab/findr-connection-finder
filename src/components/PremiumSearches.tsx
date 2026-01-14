import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Euro, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PremiumSearch {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    is_premium: boolean | null;
  } | null;
}

const urgencyLabels: Record<string, string> = {
  "3-days": "3 jours",
  "1-week": "1 semaine",
  "2-weeks": "2 semaines",
  "1-month": "1 mois",
  "no-rush": "Pas pressé",
  "normal": "Normal",
};

const PremiumSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<PremiumSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumSearches();
  }, []);

  const fetchPremiumSearches = async () => {
    // First get featured searches, then fall back to regular ones if none exist
    const { data: featuredData, error: featuredError } = await supabase
      .from("searches")
      .select(`
        id, title, category, budget_min, budget_max, urgency, image_url,
        profiles!searches_user_id_fkey(full_name, avatar_url, is_premium)
      `)
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!featuredError && featuredData && featuredData.length > 0) {
      setSearches(featuredData as any);
    } else {
      // Fallback: get latest searches from premium users or just latest
      const { data, error } = await supabase
        .from("searches")
        .select(`
          id, title, category, budget_min, budget_max, urgency, image_url,
          profiles!searches_user_id_fkey(full_name, avatar_url, is_premium)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setSearches(data as any);
      }
    }
    setLoading(false);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}-${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return "Non défini";
  };

  if (loading || searches.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Annonces Premium</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary">
            Recherches mises en avant
          </h2>
          <p className="text-muted-foreground mt-2">
            Les annonces prioritaires de notre communauté
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {searches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              onClick={() => navigate(`/recherche/${search.id}`)}
              className="group relative bg-card rounded-2xl overflow-hidden border-2 border-accent/30 hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Premium badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-accent text-accent-foreground gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                {search.image_url ? (
                  <img
                    src={search.image_url}
                    alt={search.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <span className="text-5xl">✨</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm"
                >
                  {search.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {search.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <Euro className="w-4 h-4 text-accent" />
                    {formatBudget(search.budget_min, search.budget_max)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-accent" />
                    {urgencyLabels[search.urgency || "normal"] || search.urgency}
                  </span>
                </div>

                {/* User */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {search.profiles?.avatar_url ? (
                    <img
                      src={search.profiles.avatar_url}
                      alt={search.profiles.full_name || "User"}
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                      {search.profiles?.full_name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-primary">
                    {search.profiles?.full_name || "Utilisateur"}
                  </span>
                  {search.profiles?.is_premium && (
                    <Crown className="w-4 h-4 text-accent" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumSearches;