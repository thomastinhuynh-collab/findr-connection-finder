import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Euro, 
  MapPin, 
  MessageCircle, 
  ArrowLeft, 
  Calendar,
  User,
  Gift,
  Star,
  Shield
} from "lucide-react";

// Shared data - in a real app this would come from a database
const searches = [
  {
    id: 1,
    title: "Veste en cuir oversize années 80",
    description: "Je recherche une veste en cuir vintage style oversize des années 80. Idéalement en cuir noir ou marron foncé, avec des épaulettes et une coupe ample. Taille M/L. Je cherche un modèle en bon état, avec une patine naturelle qui lui donne du caractère. Pas de déchirures importantes, mais les petites marques d'usure sont les bienvenues pour l'authenticité.",
    category: "Mode Vintage",
    budget: "100-150€",
    deadline: "5 jours",
    location: "Paris",
    proposals: 12,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    user: { 
      name: "Marie L.", 
      avatar: "https://i.pravatar.cc/40?img=1",
      rating: 4.8,
      searches: 15
    },
    urgent: true,
    createdAt: "Il y a 2h",
  },
  {
    id: 2,
    title: "Carte Dracaufeu 1ère édition",
    description: "Collectionneur passionné, je recherche une carte Dracaufeu (Charizard) de la première édition française ou anglaise. État minimum Near Mint. Je suis ouvert aux versions holographiques ou non. Un certificat d'authenticité serait un plus mais pas obligatoire si l'état est impeccable.",
    category: "Pop Culture & TCG",
    budget: "50-100€",
    deadline: "2 semaines",
    location: "Lyon",
    proposals: 8,
    image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&h=600&fit=crop",
    user: { 
      name: "Lucas M.", 
      avatar: "https://i.pravatar.cc/40?img=2",
      rating: 4.5,
      searches: 8
    },
    urgent: false,
    createdAt: "Il y a 5h",
  },
  {
    id: 3,
    title: "Vinyle The Dark Side of the Moon pressage original",
    description: "Fan de Pink Floyd depuis toujours, je cherche un pressage original de The Dark Side of the Moon (1973). Idéalement un pressage UK ou US avec les posters et stickers d'origine. Le vinyle doit être en très bon état, jouable sans craquements excessifs. La pochette peut avoir des signes d'usure légère.",
    category: "Vinyles & Musique",
    budget: "80-200€",
    deadline: "1 semaine",
    location: "Bordeaux",
    proposals: 5,
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&h=600&fit=crop",
    user: { 
      name: "Sophie B.", 
      avatar: "https://i.pravatar.cc/40?img=3",
      rating: 4.9,
      searches: 22
    },
    urgent: false,
    createdAt: "Il y a 8h",
  },
  {
    id: 4,
    title: "Polaroid SX-70 fonctionnel",
    description: "Photographe amateur, je recherche un Polaroid SX-70 en état de marche. Le modèle original chromé est préféré mais je suis ouvert aux autres versions. L'appareil doit être testé et fonctionnel. Un étui d'origine serait un bonus appréciable.",
    category: "Photo & Électronique",
    budget: "150-250€",
    deadline: "3 jours",
    location: "Marseille",
    proposals: 15,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop",
    user: { 
      name: "Thomas R.", 
      avatar: "https://i.pravatar.cc/40?img=4",
      rating: 4.7,
      searches: 12
    },
    urgent: true,
    createdAt: "Il y a 12h",
  },
  {
    id: 5,
    title: "Lampe Jielde vintage",
    description: "Je cherche une lampe Jielde vintage authentique pour mon bureau. Modèle 2 ou 3 bras. Couleur originale de préférence (vert, gris industriel). Elle doit être fonctionnelle avec son système articulé en bon état. Les traces d'usure industrielle sont appréciées.",
    category: "Déco & Mobilier",
    budget: "80-150€",
    deadline: "10 jours",
    location: "Nantes",
    proposals: 3,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop",
    user: { 
      name: "Emma V.", 
      avatar: "https://i.pravatar.cc/40?img=5",
      rating: 4.6,
      searches: 5
    },
    urgent: false,
    createdAt: "Hier",
  },
  {
    id: 6,
    title: "Montre Seiko SKX007",
    description: "Je recherche une Seiko SKX007 d'occasion en bon état. Le mouvement doit être précis (moins de 15s/jour de dérive). Le cadran et les aiguilles doivent être originaux. Un bracelet NATO ou jubilé serait apprécié mais je peux aussi prendre juste la montre.",
    category: "Bijoux & Accessoires",
    budget: "200-350€",
    deadline: "1 semaine",
    location: "Toulouse",
    proposals: 7,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop",
    user: { 
      name: "Pierre D.", 
      avatar: "https://i.pravatar.cc/40?img=6",
      rating: 4.4,
      searches: 18
    },
    urgent: false,
    createdAt: "Il y a 2 jours",
  },
];

const SearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const search = searches.find(s => s.id === Number(id));
  
  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Annonce non trouvée
            </h1>
            <Button onClick={() => navigate("/recherches")}>
              Retour aux recherches
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </motion.button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <img
                  src={search.image}
                  alt={search.title}
                  className="w-full h-[400px] object-cover"
                />
                {search.urgent && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                    Urgent
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-sm px-3 py-1"
                >
                  {search.category}
                </Badge>
              </div>

              {/* Title & Meta */}
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
                {search.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Euro className="w-4 h-4 text-accent" />
                  {search.budget}
                </span>
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-accent" />
                  {search.deadline}
                </span>
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4 text-accent" />
                  {search.location}
                </span>
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-accent" />
                  {search.createdAt}
                </span>
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {search.description}
                </p>
              </div>

              {/* Proposals */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Propositions reçues</h2>
                  <span className="flex items-center gap-2 text-accent font-medium">
                    <MessageCircle className="w-5 h-5" />
                    {search.proposals} propositions
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {search.proposals} findrs ont déjà proposé des trouvailles pour cette recherche.
                </p>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* User Card */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Publié par</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={search.user.avatar}
                    alt={search.user.name}
                    className="w-14 h-14 rounded-full border-2 border-accent"
                  />
                  <div>
                    <p className="font-semibold text-primary">{search.user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{search.user.rating}</span>
                      <span>•</span>
                      <span>{search.user.searches} recherches</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <Button 
                  size="lg" 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => navigate(`/messagerie/${id}`)}
                >
                  <MessageCircle className="w-5 h-5" />
                  Envoyer un message
                </Button>
                
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/proposition/${id}`)}
                >
                  <Gift className="w-5 h-5" />
                  Faire une proposition
                </Button>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Proposez votre trouvaille au Buyr avec photos et prix
                </p>
              </div>

              {/* Trust badges */}
              <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>Paiement sécurisé via Findr</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchDetail;
