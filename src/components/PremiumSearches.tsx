import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Heart, ExternalLink, Users, Crown, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PremiumSearch {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  user_id: string;
}

const urgencyLabels: Record<string, string> = {
  "3-days": "3 jours restants",
  "1-week": "1 semaine restante",
  "2-weeks": "2 semaines restantes",
  "1-month": "1 mois restant",
  "no-rush": "Pas pressé",
  "normal": "Normal",
};

const PremiumSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<PremiumSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [profileCities, setProfileCities] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPremiumSearches();
  }, []);

  const fetchPremiumSearches = async () => {
    const { data: featuredData, error: featuredError } = await supabase
      .from("searches")
      .select("id, title, description, category, budget_min, budget_max, urgency, image_url, user_id")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    let searchesToUse = featuredData;

    if (featuredError || !featuredData || featuredData.length === 0) {
      const { data, error } = await supabase
        .from("searches")
        .select("id, title, description, category, budget_min, budget_max, urgency, image_url, user_id")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        searchesToUse = data;
      }
    }

    if (searchesToUse && searchesToUse.length > 0) {
      setSearches(searchesToUse);

      const userIds = [...new Set(searchesToUse.map(s => s.user_id))];
      const searchIds = searchesToUse.map(s => s.id);

      const [proposalsRes, profilesRes] = await Promise.all([
        supabase.from("proposals").select("search_id").in("search_id", searchIds),
        supabase.from("profiles").select("user_id, city").in("user_id", userIds),
      ]);

      if (proposalsRes.data) {
        const counts: Record<string, number> = {};
        proposalsRes.data.forEach(p => {
          counts[p.search_id] = (counts[p.search_id] || 0) + 1;
        });
        setProposalCounts(counts);
      }

      if (profilesRes.data) {
        const cities: Record<string, string> = {};
        profilesRes.data.forEach(p => {
          if (p.city) cities[p.user_id] = p.city;
        });
        setProfileCities(cities);
      }
    }

    setLoading(false);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    const fmt = (n: number) => n.toLocaleString("fr-FR");
    if (min && max) return `${fmt(min)}€ – ${fmt(max)}€`;
    if (max) return `< ${fmt(max)}€`;
    if (min) return `> ${fmt(min)}€`;
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

        <div className="grid md:grid-cols-3 gap-8">
          {searches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group bg-card rounded-2xl overflow-hidden border-2 border-accent/30 hover:border-accent shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-secondary">
                <div className="absolute inset-0 overflow-hidden">
                  {search.image_url ? (
                    <img
                      src={search.image_url}
                      alt={search.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <span className="text-5xl">✨</span>
                    </div>
                  )}
                </div>

                {/* Category badge top-left */}
                <Badge className="absolute top-3 left-3 bg-card text-primary font-medium text-xs px-3 py-1 shadow-sm border-0">
                  {search.category}
                </Badge>

                {/* Heart icon top-right */}
                <button
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="w-5 h-5 text-primary" />
                </button>

                {/* Urgency badge bottom-left */}
                {search.urgency && search.urgency !== "no-rush" && search.urgency !== "normal" && (
                  <Badge className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-primary font-medium text-xs px-3 py-1.5 shadow-sm border-0 gap-1.5 !transition-none !transform-none">
                    <Clock className="w-3.5 h-3.5" />
                    {urgencyLabels[search.urgency] || search.urgency}
                  </Badge>
                )}

                {/* Premium indicator */}
                <Badge className="absolute bottom-3 right-3 bg-accent text-accent-foreground gap-1 border-0">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col">
                <h3 className="font-bold text-xl text-primary mb-1.5 line-clamp-1">
                  {search.title}
                </h3>
                {search.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {search.description}
                  </p>
                )}

                {/* Budget */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Budget
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {formatBudget(search.budget_min, search.budget_max)}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5 pt-3 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {proposalCounts[search.id] || 0} offres
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profileCities[search.user_id] || "France"}
                  </span>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate(`/recherche/${search.id}`)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl gap-2"
                >
                  Voir les détails
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumSearches;
