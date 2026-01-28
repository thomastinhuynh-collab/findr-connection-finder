import { motion } from "framer-motion";
import { Users, Search, Star, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "850+",
    label: "Chineurs actifs",
  },
  {
    icon: Search,
    value: "2.5K+",
    label: "Objets trouvés",
  },
  {
    icon: Star,
    value: "98%",
    label: "Satisfaction",
  },
  {
    icon: TrendingUp,
    value: "24h",
    label: "Temps moyen",
  },
];

const SocialProof = () => {
  return (
    <section 
      className="py-24"
      style={{ backgroundColor: 'hsl(40 30% 85%)' }} // Bone
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ 
              color: 'hsl(230 84% 14%)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            850 chineurs sont déjà prêts
            <br />
            <span className="italic">à chercher pour vous</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'hsl(43 49% 58% / 0.15)' }}
              >
                <stat.icon 
                  className="w-8 h-8" 
                  style={{ color: 'hsl(43 49% 58%)' }}
                />
              </div>
              <p 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ 
                  color: 'hsl(230 84% 14%)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                {stat.value}
              </p>
              <p 
                className="text-sm uppercase tracking-wider font-medium"
                style={{ color: 'hsl(230 50% 35%)' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
