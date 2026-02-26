import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, ExternalLink, Users, MapPin } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import SearchImageCarousel from "./SearchImageCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SearchWithProfile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
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

const FeaturedSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SearchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [profileCities, setProfileCities] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select("id, title, description, category, budget_min, budget_max, urgency, image_url, image_urls, created_at, user_id")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching searches:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setSearches(data);

      const userIds = [...new Set(data.map(s => s.user_id))];
      const searchIds = data.map(s => s.id);

      // Fetch proposal counts and profiles in parallel
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

  if (loading) {
    return (
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (searches.length === 0) {
    return (
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Recherches actives
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-4 mb-8">
              Ils cherchent, tu trouves
            </h2>
            <p className="text-muted-foreground mb-8">
              Aucune recherche pour le moment. Sois le premier à poster !
            </p>
            <Button onClick={() => navigate("/poster")} className="btn-hero">
              Poster ma recherche
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Recherches actives
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-4">
              Ils cherchent, tu trouves
            </h2>
          </div>
          <Button variant="outline" onClick={() => navigate("/recherches")} className="self-start md:self-auto">
            Voir toutes les recherches
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {searches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-vintage transition-all duration-300 border border-border"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-secondary">
                <div className="absolute inset-0 overflow-hidden">
                  <SearchImageCarousel
                    images={[
                      ...(search.image_urls?.length ? search.image_urls : search.image_url ? [search.image_url] : []),
                    ]}
                    alt={search.title}
                  />
                </div>

                {/* Category badge top-left */}
                <Badge className="absolute top-3 left-3 bg-card text-primary font-medium text-xs px-3 py-1 shadow-sm border-0">
                  {search.category}
                </Badge>

                {/* Heart icon top-right */}
                <FavoriteButton searchId={search.id} className="absolute top-3 right-3" />

                {/* Urgency badge bottom-left */}
                {search.urgency && search.urgency !== "no-rush" && search.urgency !== "normal" && (
                  <Badge className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-primary font-medium text-xs px-3 py-1.5 shadow-sm border-0 gap-1.5 !transition-none !transform-none">
                    <Clock className="w-3.5 h-3.5" />
                    {urgencyLabels[search.urgency] || search.urgency}
                  </Badge>
                )}
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

export default FeaturedSearches;
