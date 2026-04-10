import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import catModeVintage from "@/assets/cat-mode-vintage.jpg";
import catPopCulture from "@/assets/cat-pop-culture.jpg";
import catObjetsCollection from "@/assets/cat-objets-collection.jpg";
import catDecoVintage from "@/assets/cat-deco-vintage.jpg";

const categories = [
  {
    name: "Mode Vintage",
    slug: "Mode Vintage",
    image: catModeVintage,
    description: "Vestes en cuir, denim, fripes 70s-90s",
  },
  {
    name: "Pop Culture & Collector",
    slug: "Pop Culture & TCG",
    image: catPopCulture,
    description: "Figurines, comics, cartes, vinyles",
  },
  {
    name: "Objets de Collection",
    slug: "Bijoux & Accessoires",
    image: catObjetsCollection,
    description: "Montres, appareils photo, curiosités",
  },
  {
    name: "Décoration Vintage",
    slug: "Déco & Mobilier",
    image: catDecoVintage,
    description: "Mobilier mid-century, affiches, luminaires",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/recherches?category=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="py-24" style={{ backgroundColor: 'hsl(42 33% 94%)' }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="text-sm font-barlow font-medium uppercase tracking-wider"
            style={{ color: 'hsl(25 50% 45%)' }}
          >
            Catégories
          </span>
          <h2
            className="text-3xl md:text-5xl font-poppins font-bold mt-4"
            style={{ color: 'hsl(224 67% 19%)' }}
          >
            Qu'est-ce qu'on trouve sur Findr ?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {categories.map((cat, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleCategoryClick(cat.slug)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                width={640}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to top, hsl(224 67% 10% / 0.85) 0%, hsl(224 67% 10% / 0.3) 50%, hsl(224 67% 10% / 0.15) 100%)',
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to top, hsl(25 50% 45% / 0.3) 0%, transparent 50%)',
                }}
              />

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3
                  className="text-xl font-poppins font-bold mb-1"
                  style={{ color: 'hsl(42 33% 94%)' }}
                >
                  {cat.name}
                </h3>
                <p
                  className="text-sm opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'hsl(42 33% 94%)' }}
                >
                  {cat.description}
                </p>

                {/* Arrow indicator */}
                <div
                  className="mt-3 text-xs font-barlow font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  style={{ color: 'hsl(38 52% 69%)' }}
                >
                  <span>Voir les recherches →</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
