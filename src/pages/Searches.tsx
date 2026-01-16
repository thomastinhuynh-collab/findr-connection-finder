import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Euro, MessageCircle, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserBadge from "@/components/UserBadge";

interface SearchItem {
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

const categories = [
  "Toutes",
  "Mode Vintage",
  "Pop Culture & TCG",
  "Vinyles & Musique",
  "Photo & Électronique",
  "Bijoux & Accessoires",
  "Déco & Mobilier",
];

const Searches = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSearches();
  }, [selectedCategory]);

  const fetchSearches = async () => {
    setLoading(true);
    let query = supabase
      .from("searches")
      .select("id, title, category, budget_min, budget_max, urgency, image_url, created_at, user_id")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (selectedCategory !== "Toutes") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching searches:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
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
    } else {
      setSearches([]);
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Il y a moins d'1h";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const filteredSearches = searches.filter((search) =>
    search.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">
              Recherches actives
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Parcours les demandes des buyrs et propose tes trouvailles pour gagner des commissions
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-12 gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Plus de filtres
            </Button>
          </motion.div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredSearches.length} recherche{filteredSearches.length > 1 ? "s" : ""} trouvée{filteredSearches.length > 1 ? "s" : ""}
          </p>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredSearches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucune recherche trouvée</p>
              <Button onClick={() => navigate("/poster")}>Poster ma recherche</Button>
            </div>
          )}

          {/* Search Grid */}
          {!loading && filteredSearches.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSearches.map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
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
                      variant="secondary" 
                      className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
                    >
                      {search.category}
                    </Badge>
                    <span className="absolute bottom-3 right-3 text-xs text-secondary bg-primary/70 backdrop-blur-sm px-2 py-1 rounded">
                      {formatDate(search.created_at)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {search.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Euro className="w-3.5 h-3.5" />
                        {formatBudget(search.budget_min, search.budget_max)}
                      </span>
                      <span className="flex items-center gap-1">
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Searches;
