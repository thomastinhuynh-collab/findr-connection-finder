import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Euro, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import UserBadge from "./UserBadge";

interface PremiumSearch {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  user_id: string;
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
      .select("id, title, category, budget_min, budget_max, urgency, image_url, user_id")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    let searchesToUse = featuredData;
    
    if (featuredError || !featuredData || featuredData.length === 0) {
      // Fallback: get latest searches
      const { data, error } = await supabase
        .from("searches")
        .select("id, title, category, budget_min, budget_max, urgency, image_url, user_id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        searchesToUse = data;
      }
    }

    if (searchesToUse && searchesToUse.length > 0) {
      // Fetch profiles separately
      const userIds = [...new Set(searchesToUse.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, is_premium")
        .in("user_id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const searchesWithProfiles = searchesToUse.map(search => ({
        ...search,
        profiles: profilesMap.get(search.user_id) || null
      }));
      
      setSearches(searchesWithProfiles as any);
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

                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md text-accent font-medium">
                    <Euro className="w-4 h-4" />
                    {formatBudget(search.budget_min, search.budget_max)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md text-accent font-medium">
                    <Clock className="w-4 h-4" />
                    {urgencyLabels[search.urgency || "normal"] || search.urgency}
                  </span>
                </div>

                {/* User */}
                <div className="pt-3 border-t border-border">
                  <UserBadge
                    userId={search.user_id}
                    fullName={search.profiles?.full_name || null}
                    avatarUrl={search.profiles?.avatar_url || null}
                    isPremium={search.profiles?.is_premium || false}
                    size="lg"
                  />
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