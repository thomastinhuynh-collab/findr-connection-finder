import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Euro, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import UserBadge from "./UserBadge";

interface SearchWithProfile {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
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

const FeaturedSearches = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SearchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Error fetching searches:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      // Fetch profiles separately
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const searchesWithProfiles = data.map(search => ({
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {searches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(`/recherche/${search.id}`)}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-vintage transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-secondary">
                {search.image_url ? (
                  <img
                    src={search.image_url}
                    alt={search.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🔍</span>
                  </div>
                )}
                {search.urgency === "3-days" && (
                  <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                    Urgent
                  </Badge>
                )}
                <Badge 
                  className="absolute top-3 right-3 bg-accent text-accent-foreground font-medium"
                >
                  {search.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {search.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-xs mb-4">
                  <span className="flex items-center gap-1 text-accent font-medium">
                    <Euro className="w-3.5 h-3.5" />
                    {formatBudget(search.budget_min, search.budget_max)}
                  </span>
                  <span className="flex items-center gap-1 text-accent font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {urgencyLabels[search.urgency || "normal"] || search.urgency}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <UserBadge
                    userId={search.user_id}
                    fullName={search.profiles?.full_name || null}
                    avatarUrl={search.profiles?.avatar_url || null}
                    showCrown={false}
                  />
                  <span className="flex items-center gap-1 text-sm text-accent font-medium">
                    <MessageCircle className="w-4 h-4" />
                    0
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSearches;