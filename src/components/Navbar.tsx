import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Crown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // On homepage, navbar starts transparent and becomes solid on scroll
  const navStyle = isHomePage && !scrolled
    ? { backgroundColor: 'transparent', borderColor: 'transparent' }
    : { backgroundColor: 'hsl(40 30% 85% / 0.98)', borderColor: 'hsl(230 15% 75%)' };

  const textColor = isHomePage && !scrolled
    ? 'hsl(40 30% 85%)'
    : 'hsl(230 84% 14%)';

  const mutedColor = isHomePage && !scrolled
    ? 'hsl(40 30% 85% / 0.7)'
    : 'hsl(230 50% 35%)';

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300"
        style={{ 
          ...navStyle,
          borderBottom: scrolled || !isHomePage ? '1px solid hsl(230 15% 75%)' : 'none'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <span 
                className="text-2xl font-bold transition-colors"
                style={{ 
                  color: textColor,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                findr
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/recherches" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: mutedColor }}
              >
                Recherches
              </Link>
              <Link 
                to="/comment-ca-marche" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: mutedColor }}
              >
                Comment ça marche
              </Link>
              <Link 
                to="/devenir-findr" 
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: mutedColor }}
              >
                Devenir Findr
              </Link>
              <Link 
                to="/premium" 
                className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5"
                style={{ color: 'hsl(43 49% 58%)' }}
              >
                <Crown className="w-4 h-4" />
                Premium
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
              ) : user ? (
                <>
                  <NotificationBell />
                  <Button 
                    size="sm" 
                    className="rounded-lg font-medium"
                    style={{
                      backgroundColor: 'hsl(43 49% 58%)',
                      color: 'hsl(230 84% 14%)'
                    }}
                    asChild
                  >
                    <Link to="/mon-espace">
                      <User className="w-4 h-4 mr-2" />
                      Mon espace
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="font-medium"
                    style={{ color: textColor }}
                    onClick={() => openAuthModal("login")}
                  >
                    Connexion
                  </Button>
                  <Button 
                    size="sm" 
                    className="rounded-lg font-medium"
                    style={{
                      backgroundColor: 'hsl(43 49% 58%)',
                      color: 'hsl(230 84% 14%)'
                    }}
                    onClick={() => openAuthModal("signup")}
                  >
                    Inscription
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: textColor }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div 
              className="md:hidden py-6 animate-slide-up"
              style={{ 
                borderTop: '1px solid hsl(230 15% 75%)',
                backgroundColor: 'hsl(40 30% 85%)'
              }}
            >
              <div className="flex flex-col gap-4">
                <Link 
                  to="/recherches" 
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'hsl(230 84% 14%)' }}
                >
                  Recherches
                </Link>
                <Link 
                  to="/comment-ca-marche" 
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'hsl(230 84% 14%)' }}
                >
                  Comment ça marche
                </Link>
                <Link 
                  to="/devenir-findr" 
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'hsl(230 84% 14%)' }}
                >
                  Devenir Findr
                </Link>
                <Link 
                  to="/premium" 
                  className="text-sm font-semibold flex items-center gap-1.5"
                  style={{ color: 'hsl(43 49% 58%)' }}
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </Link>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {loading ? (
                    <div className="animate-pulse bg-muted h-8 w-full rounded"></div>
                  ) : user ? (
                    <>
                      <div className="flex justify-center mb-2">
                        <NotificationBell />
                      </div>
                      <Button 
                        size="sm" 
                        className="rounded-lg"
                        style={{
                          backgroundColor: 'hsl(43 49% 58%)',
                          color: 'hsl(230 84% 14%)'
                        }}
                        asChild
                      >
                        <Link to="/mon-espace">Mon espace</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openAuthModal("login")}
                      >
                        Connexion
                      </Button>
                      <Button 
                        size="sm" 
                        className="rounded-lg"
                        style={{
                          backgroundColor: 'hsl(43 49% 58%)',
                          color: 'hsl(230 84% 14%)'
                        }}
                        onClick={() => openAuthModal("signup")}
                      >
                        Inscription
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
