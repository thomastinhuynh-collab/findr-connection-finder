import { useNavigate } from "react-router-dom";
import { useScrollReveal, useScrollRevealGroup } from "@/hooks/useScrollReveal";
import catModeVintage from "@/assets/cat-mode-vintage.jpg";

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
    image: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?auto=format&fit=crop&w=800&q=80",
    description: "Figurines, comics, cartes, vinyles",
  },
  {
    name: "Objets de Collection",
    slug: "Bijoux & Accessoires",
    image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80",
    description: "Montres, appareils photo, curiosités",
  },
  {
    name: "Décoration Vintage",
    slug: "Décoration Vintage",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    description: "Mobilier mid-century, affiches, luminaires",
  },
];

const Categories = () => {
  const navigate = useNavigate();
  const headingRef = useScrollReveal();
  const gridRef = useScrollRevealGroup();

  const handleCategoryClick = (slug: string) => {
    navigate(`/recherches?category=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4">
        <div ref={headingRef} className="scroll-reveal text-center mb-14">
          <span className="text-sm font-barlow font-medium uppercase tracking-wider text-accent">
            Catégories
          </span>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mt-4 text-foreground">
            Qu'est-ce qu'on trouve sur Findr ?
          </h2>
        </div>

        <div ref={gridRef} className="stagger-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(cat.slug)}
              className="stagger-item group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                width={640}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(17,33,80,0.78) 70%, rgba(17,33,80,0.92) 100%)',
                }}
              />

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to top, hsl(var(--gold) / 0.3) 0%, transparent 50%)',
                }}
              />

              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-poppins font-bold mb-1 text-cream">
                  {cat.name}
                </h3>
                <p className="text-sm text-cream/80 group-hover:text-cream transition-opacity">
                  {cat.description}
                </p>
                <div className="mt-3 text-xs font-barlow font-medium flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span>Voir les recherches →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
