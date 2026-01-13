import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Euro, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    user: {
      name: "Marie L.",
      avatar: "https://i.pravatar.cc/40?img=1",
    },
    urgent: true,
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
    user: {
      name: "Lucas M.",
      avatar: "https://i.pravatar.cc/40?img=2",
    },
    urgent: false,
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
    user: {
      name: "Sophie B.",
      avatar: "https://i.pravatar.cc/40?img=3",
    },
    urgent: false,
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
    user: {
      name: "Thomas R.",
      avatar: "https://i.pravatar.cc/40?img=4",
    },
    urgent: true,
  },
];

const FeaturedSearches = () => {
  const navigate = useNavigate();
  
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
          <Button variant="outline" className="self-start md:self-auto">
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
                    {search.proposals}
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
