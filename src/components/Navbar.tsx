import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import CategoryNav from "@/components/CategoryNav";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Comment ça marche", to: "/comment-ca-marche" },
  { label: "Je deviens buyr", to: "/poster" },
  { label: "Je deviens findr", to: "/recherches" },
  { label: "Blog", to: "/blog" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDetailPage = location.pathname.startsWith("/recherche/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: scrolled ? 'hsla(224, 67%, 19%, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(17, 33, 80, 0.15)' : 'none',
          borderBottom: scrolled ? '1px solid hsla(222, 37%, 36%, 0.3)' : '1px solid transparent',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group ml-8" style={{ color: scrolled ? '#F5F0EA' : '#112150' }}>
              <Logo />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium transition-colors"
                  style={{ color: scrolled ? 'rgba(245,240,234,0.8)' : 'rgba(17,33,80,0.75)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = scrolled ? '#F5F0EA' : '#112150')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? 'rgba(245,240,234,0.8)' : 'rgba(17,33,80,0.75)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center">
              {user ? (
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-poppins font-semibold rounded-full"
                  onClick={() => navigate("/mon-espace")}
                >
                  Mon espace
                </Button>
              ) : (
                <Button
                  size="sm"
                  className={`bg-accent text-accent-foreground hover:bg-accent/90 font-poppins font-semibold rounded-full ${isDetailPage ? 'animate-[pulse-subtle_2s_ease-in-out_infinite]' : ''}`}
                  onClick={() => setAuthModalOpen(true)}
                >
                  {isDetailPage ? "Créer mon compte gratuit" : "Rejoindre la beta"}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-cream"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-cream/20 animate-slide-up">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-medium text-cream/80 hover:text-cream transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-poppins font-semibold rounded-full w-full mt-2"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/mon-espace");
                    }}
                  >
                    Mon espace
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-poppins font-semibold rounded-full w-full mt-2"
                    onClick={() => {
                      setIsOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    Rejoindre la beta
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="fixed top-16 left-0 right-0 z-40">
        <CategoryNav />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
};

export default Navbar;
