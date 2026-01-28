import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Coins, Star, Zap, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Coins,
    title: "Gagne de l'argent",
    description: "Fixe ta marge librement ! La plateforme prélève seulement 5% (0% en Premium) + 3% de frais d'authentification.",
  },
  {
    icon: Trophy,
    title: "Grimpe les classements",
    description: "Accumule de l'XP, débloque des badges et deviens un Findr légendaire.",
  },
  {
    icon: Star,
    title: "Monétise ta passion",
    description: "Tu adores chiner ? Transforme ton hobby en source de revenus.",
  },
  {
    icon: Zap,
    title: "Missions exclusives",
    description: "Accède à des recherches premium et des collaborations avec des marques.",
  },
];

const badges = [
  { name: "Chineur Expert", color: "bg-amber-500" },
  { name: "Trouveur en Or", color: "bg-yellow-500" },
  { name: "5 Missions", color: "bg-emerald-500" },
  { name: "Top Vintage", color: "bg-violet-500" },
];

const BecomeFindr = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'hsl(42 33% 94%)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'hsl(38 52% 69%)' }}>
              Rejoins la communauté
            </span>
            <h2 className="text-3xl md:text-5xl font-barlow font-bold mt-4 mb-6" style={{ color: 'hsl(42 33% 94%)' }}>
              Deviens Findr et <span className="text-gradient">gagne en chinant</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: 'hsl(42 33% 94% / 0.8)' }}>
              Tu adores les brocantes, les friperies, les trouvailles rares ? 
              Rejoins notre communauté de chasseurs de trésors et monétise ta passion.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(42 33% 94% / 0.1)' }}>
                    <benefit.icon className="w-5 h-5" style={{ color: 'hsl(38 52% 69%)' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: 'hsl(42 33% 94%)' }}>{benefit.title}</h4>
                    <p className="text-sm" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="btn-gold text-base px-8 py-6 rounded-full">
              Devenir Findr
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Card preview */}
            <div className="backdrop-blur-sm rounded-3xl p-8 border" style={{ backgroundColor: 'hsl(42 33% 94% / 0.1)', borderColor: 'hsl(42 33% 94% / 0.2)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">M</span>
                </div>
                <div>
                  <h4 className="text-xl font-barlow font-bold" style={{ color: 'hsl(42 33% 94%)' }}>@MarieChineuse</h4>
                  <p style={{ color: 'hsl(42 33% 94% / 0.6)' }}>Findr Expert • Paris</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(42 33% 94% / 0.1)' }}>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(38 52% 69%)' }}>156</p>
                  <p className="text-xs" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>Objets trouvés</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(42 33% 94% / 0.1)' }}>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(38 52% 69%)' }}>4.9</p>
                  <p className="text-xs" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>Note moyenne</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(42 33% 94% / 0.1)' }}>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(38 52% 69%)' }}>2.4K</p>
                  <p className="text-xs" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>XP Total</p>
                </div>
              </div>

              {/* Badges */}
              <div>
                <p className="text-sm mb-3" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>Badges obtenus</p>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${badge.color} text-white`}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'hsl(42 33% 94% / 0.6)' }}>Niveau 12</span>
                  <span style={{ color: 'hsl(38 52% 69%)' }}>2,400 / 3,000 XP</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(42 33% 94% / 0.2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "80%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 px-4 py-2 bg-accent rounded-full text-primary text-sm font-bold shadow-glow"
            >
              +50 XP 🎉
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BecomeFindr;
