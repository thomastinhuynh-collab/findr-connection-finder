import { useNavigate } from "react-router-dom";
import { useScrollReveal, useScrollRevealGroup } from "@/hooks/useScrollReveal";
import catModeVintage from "@/assets/cat-mode-vintage.jpg";
import catPopCulture from "@/assets/cat-pop-culture.jpg";
import catObjetsDivers from "@/assets/cat-objets-divers.jpg";

const categories = [
  {
    name: "Mode & Maroquinerie",
    slug: "Mode & Maroquinerie",
    image: catModeVintage,
    description: "Vestes en cuir, denim, fripes 70s-90s, sacs",
    subcategories: "Mode & Maroquinerie · Vinyles & Musique · Bijoux & Accessoires",
  },
  {
    name: "Pop Culture",
    slug: "Pop Culture & TCG",
    image: catPopCulture,
    description: "Figurines, comics, cartes, vinyles",
    subcategories: "Comics · Figurines · Cartes TCG · Jeux vidéo",
  },
  {
    name: "Objets Divers",
    slug: "Bijoux & Accessoires",
    image: catObjetsDivers,
    description: "Montres, appareils photo, curiosités",
    subcategories: "Photo & Électronique · Horlogerie · Livres · Curiosités",
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

        <div ref={gridRef} className="stagger-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
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
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(7,14,66,0.78) 70%, rgba(7,14,66,0.92) 100%)',
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
                <p className="mt-2 text-xs text-cream/60 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 leading-relaxed">
                  {cat.subcategories}
                </p>
                <div className="mt-2 text-xs font-barlow font-medium flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
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
