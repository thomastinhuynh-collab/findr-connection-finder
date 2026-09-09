import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { CATEGORIES } from "@/lib/categories";

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
          {CATEGORIES.map((category) => (
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
