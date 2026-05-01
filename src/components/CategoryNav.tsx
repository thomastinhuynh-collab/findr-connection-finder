import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface SubCategory {
  name: string;
  slug: string;
}

interface Category {
  name: string;
  slug: string;
  subcategories: SubCategory[];
}

const categories: Category[] = [
  {
    name: "Mode & Maroquinerie",
    slug: "Mode & Maroquinerie",
    subcategories: [
      { name: "Vestes & Manteaux", slug: "Mode & Maroquinerie&sub=Vestes & Manteaux" },
      { name: "T-shirts & Sweats", slug: "Mode & Maroquinerie&sub=T-shirts & Sweats" },
      { name: "Pantalons & Jeans", slug: "Mode & Maroquinerie&sub=Pantalons & Jeans" },
      { name: "Robes & Jupes", slug: "Mode & Maroquinerie&sub=Robes & Jupes" },
      { name: "Chaussures", slug: "Mode & Maroquinerie&sub=Chaussures" },
      { name: "Sportswear", slug: "Mode & Maroquinerie&sub=Sportswear" },
    ],
  },
  {
    name: "Pop Culture & TCG",
    slug: "Pop Culture & TCG",
    subcategories: [
      { name: "Cartes Pokémon", slug: "Pop Culture & TCG&sub=Cartes Pokémon" },
      { name: "Cartes Yu-Gi-Oh!", slug: "Pop Culture & TCG&sub=Cartes Yu-Gi-Oh!" },
      { name: "Cartes Magic", slug: "Pop Culture & TCG&sub=Cartes Magic" },
      { name: "Figurines & Jouets", slug: "Pop Culture & TCG&sub=Figurines & Jouets" },
      { name: "Mangas & Comics", slug: "Pop Culture & TCG&sub=Mangas & Comics" },
      { name: "Jeux vidéo rétro", slug: "Pop Culture & TCG&sub=Jeux vidéo rétro" },
    ],
  },
  {
    name: "Vinyles & Musique",
    slug: "Vinyles & Musique",
    subcategories: [
      { name: "Vinyles 33 tours", slug: "Vinyles & Musique&sub=Vinyles 33 tours" },
      { name: "Vinyles 45 tours", slug: "Vinyles & Musique&sub=Vinyles 45 tours" },
      { name: "Cassettes", slug: "Vinyles & Musique&sub=Cassettes" },
      { name: "CD collectors", slug: "Vinyles & Musique&sub=CD collectors" },
      { name: "Platines & Hi-Fi", slug: "Vinyles & Musique&sub=Platines & Hi-Fi" },
    ],
  },
  {
    name: "Photo & Électronique",
    slug: "Photo & Électronique",
    subcategories: [
      { name: "Appareils argentiques", slug: "Photo & Électronique&sub=Appareils argentiques" },
      { name: "Objectifs vintage", slug: "Photo & Électronique&sub=Objectifs vintage" },
      { name: "Accessoires photo", slug: "Photo & Électronique&sub=Accessoires photo" },
      { name: "Consoles rétro", slug: "Photo & Électronique&sub=Consoles rétro" },
      { name: "Audio vintage", slug: "Photo & Électronique&sub=Audio vintage" },
    ],
  },
  {
    name: "Bijoux & Accessoires",
    slug: "Bijoux & Accessoires",
    subcategories: [
      { name: "Bagues & Bracelets", slug: "Bijoux & Accessoires&sub=Bagues & Bracelets" },
      { name: "Colliers & Pendentifs", slug: "Bijoux & Accessoires&sub=Colliers & Pendentifs" },
      { name: "Montres vintage", slug: "Bijoux & Accessoires&sub=Montres vintage" },
      { name: "Sacs & Pochettes", slug: "Bijoux & Accessoires&sub=Sacs & Pochettes" },
      { name: "Lunettes", slug: "Bijoux & Accessoires&sub=Lunettes" },
    ],
  },
];

const CategoryNav = () => {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleCategoryClick = (slug: string) => {
    navigate(`/recherches?category=${encodeURIComponent(slug)}`);
    setOpenCategory(null);
  };

  const handleSubCategoryClick = (categorySlug: string, subSlug: string) => {
    navigate(`/recherches?category=${encodeURIComponent(categorySlug)}&sub=${encodeURIComponent(subSlug)}`);
    setOpenCategory(null);
  };

  const location = useLocation();
  const goBack = useGoBack("/recherches");
  const isDetailPage = location.pathname.startsWith("/recherche/");

  return (
    <div
      className="hidden md:block"
      style={{
        background: 'rgba(27,42,74,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-0">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="relative"
              onMouseEnter={() => setOpenCategory(category.slug)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <button
                onClick={() => handleCategoryClick(category.slug)}
                className="flex items-center gap-1 px-4 py-2 font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
                style={{ fontSize: '13px' }}
              >
                {category.name}
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Dropdown */}
              {openCategory === category.slug && (
                <div className="absolute top-full left-0 min-w-[200px] bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                  {/* "Tout voir" link */}
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-primary hover:bg-muted transition-colors"
                  >
                    Tout voir
                  </button>
                  <div className="border-t border-border my-1" />
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => handleSubCategoryClick(category.slug, sub.name)}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
