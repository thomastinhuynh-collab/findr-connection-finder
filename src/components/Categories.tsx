import { useNavigate } from "react-router-dom";
import { useScrollReveal, useScrollRevealGroup } from "@/hooks/useScrollReveal";
import catModeVintage from "@/assets/cat-mode-vintage.jpg";
import catPopCulture from "@/assets/cat-pop-culture.jpg";
import catObjetsDivers from "@/assets/cat-objets-divers.jpg";
import { useTranslation } from "react-i18next";

const categories = [
  {
    nameKey: "categories.items.fashion.name",
    slug: "Mode & Maroquinerie",
    image: catModeVintage,
    descriptionKey: "categories.items.fashion.description",
    subcategoriesKey: "categories.items.fashion.subcategories",
  },
  {
    nameKey: "categories.items.popCulture.name",
    slug: "Pop Culture & TCG",
    image: catPopCulture,
    descriptionKey: "categories.items.popCulture.description",
    subcategoriesKey: "categories.items.popCulture.subcategories",
  },
  {
    nameKey: "categories.items.misc.name",
    slug: "Bijoux & Accessoires",
    image: catObjetsDivers,
    descriptionKey: "categories.items.misc.description",
    subcategoriesKey: "categories.items.misc.subcategories",
  },
];

const Categories = () => {
  const { t } = useTranslation();
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
            {t("categories.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-foreground">
            {t("categories.title")}
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
                alt={t(cat.nameKey)}
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
                <h3 className="text-xl font-display font-bold mb-1 text-cream">
                  {t(cat.nameKey)}
                </h3>
                <p className="text-sm text-cream/80 group-hover:text-cream transition-opacity">
                  {t(cat.descriptionKey)}
                </p>
                <p className="mt-2 text-xs text-cream/60 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 leading-relaxed">
                  {t(cat.subcategoriesKey)}
                </p>
                <div className="mt-2 text-xs font-barlow font-medium flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                  <span>{t("categories.viewSearches")}</span>
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
