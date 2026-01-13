import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Euro, MapPin, MessageCircle, Filter, SlidersHorizontal } from "lucide-react";

const searches = [
  {
    id: 1,
    title: "Veste en cuir oversize années 80",
    category: "Mode Vintage",
    budget: "100-150€",
    deadline: "5 jours",
    location: "Paris",
    proposals: 12,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
    user: { name: "Marie L.", avatar: "https://i.pravatar.cc/40?img=1" },
    urgent: true,
    createdAt: "Il y a 2h",
  },
  {
    id: 2,
    title: "Carte Dracaufeu 1ère édition",
    category: "Pop Culture & TCG",
    budget: "50-100€",
    deadline: "2 semaines",
    location: "Lyon",
    proposals: 8,
    image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop",
    user: { name: "Lucas M.", avatar: "https://i.pravatar.cc/40?img=2" },
    urgent: false,
    createdAt: "Il y a 5h",
  },
  {
    id: 3,
    title: "Vinyle The Dark Side of the Moon pressage original",
    category: "Vinyles & Musique",
    budget: "80-200€",
    deadline: "1 semaine",
    location: "Bordeaux",
    proposals: 5,
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=300&fit=crop",
    user: { name: "Sophie B.", avatar: "https://i.pravatar.cc/40?img=3" },
    urgent: false,
    createdAt: "Il y a 8h",
  },
  {
    id: 4,
    title: "Polaroid SX-70 fonctionnel",
    category: "Photo & Électronique",
    budget: "150-250€",
    deadline: "3 jours",
    location: "Marseille",
    proposals: 15,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    user: { name: "Thomas R.", avatar: "https://i.pravatar.cc/40?img=4" },
    urgent: true,
    createdAt: "Il y a 12h",
  },
  {
    id: 5,
    title: "Lampe Jielde vintage",
    category: "Déco & Mobilier",
    budget: "80-150€",
    deadline: "10 jours",
    location: "Nantes",
    proposals: 3,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
    user: { name: "Emma V.", avatar: "https://i.pravatar.cc/40?img=5" },
    urgent: false,
    createdAt: "Hier",
  },
  {
    id: 6,
    title: "Montre Seiko SKX007",
    category: "Bijoux & Accessoires",
    budget: "200-350€",
    deadline: "1 semaine",
    location: "Toulouse",
    proposals: 7,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop",
    user: { name: "Pierre D.", avatar: "https://i.pravatar.cc/40?img=6" },
    urgent: false,
    createdAt: "Il y a 2 jours",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  const filteredSearches = searches.filter((search) => {
    const matchesQuery = search.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Toutes" || search.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

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

          {/* Search Grid */}
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
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={search.image}
                    alt={search.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {search.urgent && (
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
                    {search.createdAt}
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
                      {search.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {search.deadline}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {search.location}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <img
                        src={search.user.avatar}
                        alt={search.user.name}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        {search.user.name}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-accent font-medium">
                      <MessageCircle className="w-4 h-4" />
                      {search.proposals} propositions
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Charger plus de recherches
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Searches;
