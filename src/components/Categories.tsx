import { motion } from "framer-motion";
import { Shirt, Gamepad2, Disc3, Camera, Gem, Sofa } from "lucide-react";

const categories = [
  {
    icon: Shirt,
    name: "Mode Vintage",
    count: "1.2K recherches",
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    icon: Gamepad2,
    name: "Pop Culture & TCG",
    count: "890 recherches",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Disc3,
    name: "Vinyles & Musique",
    count: "650 recherches",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Camera,
    name: "Photo & Électronique",
    count: "420 recherches",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Gem,
    name: "Bijoux & Accessoires",
    count: "380 recherches",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Sofa,
    name: "Déco & Mobilier",
    count: "520 recherches",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const Categories = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Catégories
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-4 mb-6">
            Trouve tout ce qui te fait vibrer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Du vêtement années 80 à la carte Pokémon 1ère édition, notre communauté chine dans toutes les catégories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent transition-all duration-300 text-center"
            >
              <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-primary text-sm mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.count}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
