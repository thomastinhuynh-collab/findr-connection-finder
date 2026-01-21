import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import NotificationBell from "@/components/NotificationBell";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { user, loading } = useAuth();

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18">
            {/* Logo Text */}
            <Link to="/" className="flex items-center group">
              <span className="font-display text-2xl font-bold text-primary hover:text-accent transition-colors">
                Findr
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/recherches" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Recherches
              </Link>
              <Link to="/comment-ca-marche" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Comment ça marche
              </Link>
              <Link to="/devenir-findr" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Devenir Findr
              </Link>
              <Link 
                to="/premium" 
                className="text-sm font-semibold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4 text-accent" />
                Passer Premium
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
              ) : user ? (
                <>
                  <NotificationBell />
                  <Button size="sm" className="btn-hero" asChild>
                    <Link to="/mon-espace">
                      <User className="w-4 h-4 mr-2" />
                      Mon espace
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => openAuthModal("login")}>
                    Connexion
                  </Button>
                  <Button size="sm" className="btn-hero" onClick={() => openAuthModal("signup")}>
                    <User className="w-4 h-4 mr-2" />
                    Inscription
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-up">
              <div className="flex flex-col gap-4">
                <Link to="/recherches" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Recherches
                </Link>
                <Link to="/comment-ca-marche" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Comment ça marche
                </Link>
                <Link to="/devenir-findr" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Devenir Findr
                </Link>
                <Link 
                  to="/premium" 
                  className="text-sm font-semibold text-accent hover:opacity-80 transition-opacity flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  Passer Premium
                </Link>
                {user && (
                  <Link to="/mon-espace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Mon espace
                  </Link>
                )}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {loading ? (
                    <div className="animate-pulse bg-muted h-8 w-full rounded"></div>
                  ) : user ? (
                    <>
                      <div className="flex justify-center mb-2">
                        <NotificationBell />
                      </div>
                      <Button size="sm" className="btn-hero" asChild>
                        <Link to="/mon-espace">Mon espace</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openAuthModal("login")}>
                        Connexion
                      </Button>
                      <Button size="sm" className="btn-hero" onClick={() => openAuthModal("signup")}>
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
