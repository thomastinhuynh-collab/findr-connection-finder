import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import CategoryNav from "@/components/CategoryNav";
import { useAuth } from "@/hooks/useAuth";
import HeaderActions from "@/components/HeaderActions";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const navLinks = [
  { key: "howItWorks", to: "/comment-ca-marche" },
  { key: "becomeBuyr", to: "/poster" },
  { key: "becomeFindr", to: "/recherches" },
  { key: "blog", to: "/blog" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isHomePage = location.pathname === "/";
  const isDetailPage = location.pathname.startsWith("/recherche/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHomePage) return null;


  // Homepage style: transparent/dark background with cream logo
  // Other pages style: cream/white background with navy logo and links
  const isLightMode = !isHomePage;

  const navBackground = isHomePage
    ? {
        backgroundColor: scrolled ? 'hsla(224, 67%, 19%, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(17, 33, 80, 0.15)' : 'none',
        borderBottom: scrolled ? '1px solid hsla(222, 37%, 36%, 0.3)' : '1px solid transparent',
      }
    : {
        backgroundColor: '#F5F0EA',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid rgba(17, 33, 80, 0.08)',
      };

  const logoVariant = isLightMode ? "navy" : "cream";
  const linkColorClass = isLightMode 
    ? "text-[#112150]/80 hover:text-[#112150]" 
    : "text-cream/80 hover:text-cream";
  const mobileMenuBg = isLightMode ? "bg-[#F5F0EA]" : "bg-transparent";
  const mobileLinkColor = isLightMode
    ? "text-[#112150]/80 hover:text-[#112150]"
    : "text-cream/80 hover:text-cream";
  const mobileMenuBorder = isLightMode
    ? "border-[#112150]/20"
    : "border-cream/20";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
        style={navBackground}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group ml-8">
              <Logo variant={logoVariant} size={34} />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${linkColorClass}`}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <HeaderActions variant={isLightMode ? "navy" : "gold"} />
                  <Button
                    size="sm"
                    variant="outline"
                    className={`font-poppins font-semibold rounded-full ${
                      isLightMode
                        ? "border-[#112150] text-[#112150] bg-transparent hover:bg-[#112150] hover:text-[#F5F0EA]"
                        : "border-cream text-cream bg-transparent hover:bg-cream hover:text-[#112150]"
                    }`}
                    onClick={() => navigate("/poster")}
                  >
                    {t("nav.postSearch")}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#D9BD8B] text-[#112150] hover:bg-[#D9BD8B]/90 font-poppins font-semibold rounded-full"
                    onClick={() => navigate("/mon-espace")}
                  >
                    {t("nav.mySpace")}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className={`bg-[#D9BD8B] text-[#112150] hover:bg-[#D9BD8B]/90 font-poppins font-semibold rounded-full ${isDetailPage ? 'animate-[pulse-subtle_2s_ease-in-out_infinite]' : ''}`}
                  onClick={() => setAuthModalOpen(true)}
                >
                  {isDetailPage ? "Créer mon compte gratuit" : "Rejoindre la liste d'attente"}
                </Button>
              )}
              <LanguageSwitcher variant={isLightMode ? "navy" : "gold"} />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-auto mr-1">
              <LanguageSwitcher variant={isLightMode ? "navy" : "gold"} />
            </div>
            {user && (
              <div className="md:hidden mr-1">
                <HeaderActions variant={isLightMode ? "navy" : "gold"} />
              </div>
            )}
            <button
              className={`md:hidden p-2 ${isLightMode ? 'text-[#112150]' : 'text-cream'}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className={`md:hidden py-4 border-t ${mobileMenuBorder} animate-slide-up ${mobileMenuBg}`}>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-medium transition-colors ${mobileLinkColor}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`font-poppins font-semibold rounded-full w-full mt-2 ${
                        isLightMode
                          ? "border-[#112150] text-[#112150] bg-transparent hover:bg-[#112150] hover:text-[#F5F0EA]"
                          : "border-cream text-cream bg-transparent hover:bg-cream hover:text-[#112150]"
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/poster");
                      }}
                    >
                      {t("nav.postSearch")}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#D9BD8B] text-[#112150] hover:bg-[#D9BD8B]/90 font-poppins font-semibold rounded-full w-full"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/mon-espace");
                      }}
                    >
                      {t("nav.mySpace")}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#D9BD8B] text-[#112150] hover:bg-[#D9BD8B]/90 font-poppins font-semibold rounded-full w-full mt-2"
                    onClick={() => {
                      setIsOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    Rejoindre la liste d'attente
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {isHomePage && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <CategoryNav />
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
};

export default Navbar;
