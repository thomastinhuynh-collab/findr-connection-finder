import { motion } from "framer-motion";
import { Trophy, Zap, Star, TrendingUp } from "lucide-react";

const badges = [
  { title: "Chineur Expert 80s", xp: 2500, icon: "🎸" },
  { title: "Maître Vintage", xp: 5000, icon: "👔" },
  { title: "Chasseur TCG", xp: 3200, icon: "🃏" },
  { title: "Dénicheur Vinyles", xp: 4100, icon: "🎵" },
];

const liveMissions = [
  "@Chineur_Pro vient de lancer une exploration pour une veste 80s",
  "@VintageHunter cherche une console NES en boîte complète",
  "@RetroStyle a trouvé une pépite : Levi's 501 1984",
  "@CollectorParis lance une mission cartes Pokémon 1ère édition",
  "@BrocanteLover recherche un tourne-disque Technics SL-1200",
];

const Gamification = () => {
  return (
    <section 
      className="py-32 overflow-hidden"
      style={{ backgroundColor: 'hsl(40 30% 85%)' }} // Bone
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p 
            className="text-sm uppercase tracking-widest font-medium mb-4"
            style={{ color: 'hsl(43 49% 58%)' }}
          >
            Gamification
          </p>
          <h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ 
              color: 'hsl(230 84% 14%)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Gagne en expertise,
            <br />
            <span className="italic">débloques des avantages</span>
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'hsl(230 50% 35%)' }}
          >
            Chaque mission accomplie te rapproche du statut d'expert. 
            Plus tu trouves, plus tu gagnes.
          </p>
        </motion.div>

        {/* XP Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: 'hsl(40 30% 90%)',
                borderColor: 'hsl(230 15% 80%)'
              }}
            >
              <span className="text-4xl mb-4 block">{badge.icon}</span>
              <h4 
                className="font-bold mb-2"
                style={{ 
                  color: 'hsl(230 84% 14%)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                {badge.title}
              </h4>
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ 
                  backgroundColor: 'hsl(43 49% 58%)',
                  color: 'hsl(230 84% 14%)'
                }}
              >
                <Zap className="w-3 h-3" />
                {badge.xp.toLocaleString()} XP
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Missions Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: 'hsl(230 84% 14%)',
                color: 'hsl(40 30% 85%)'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Missions en cours
            </div>
          </div>

          {/* Ticker container */}
          <div 
            className="overflow-hidden py-4 rounded-xl"
            style={{ backgroundColor: 'hsl(230 84% 14%)' }}
          >
            <div className="animate-ticker flex whitespace-nowrap">
              {[...liveMissions, ...liveMissions].map((mission, index) => (
                <span
                  key={index}
                  className="mx-8 text-sm font-medium"
                  style={{ color: 'hsl(40 30% 85% / 0.8)' }}
                >
                  {mission}
                  <span 
                    className="mx-4"
                    style={{ color: 'hsl(43 49% 58%)' }}
                  >
                    •
                  </span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Gamification;
