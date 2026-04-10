import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Crown, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";
import CategoryNav from "@/components/CategoryNav";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherches?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/recherches");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: 'hsl(0 0% 10%)', borderColor: 'hsl(0 0% 16%)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group ml-8">
              <Logo size="lg" variant="light" showTagline />
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full w-full transition-all" style={{ border: '1px solid hsl(38 33% 93% / 0.2)', backgroundColor: 'hsl(38 33% 93% / 0.06)' }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 33% 93% / 0.5)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une annonce..."
                  className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: 'hsl(38 33% 93%)', }}
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/premium" 
                className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5"
                style={{ color: 'hsl(36 62% 58%)' }}
              >
                <Crown className="w-4 h-4" />
                Passer Premium
              </Link>
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
                  <Button variant="outline" size="sm" style={{ borderColor: 'hsl(38 33% 93% / 0.3)', color: 'hsl(38 33% 93%)' }} onClick={() => openAuthModal("login")}>
                    Connexion
                  </Button>
                  <Button size="sm" style={{ backgroundColor: 'hsl(18 66% 47%)', color: 'hsl(38 33% 95%)' }} onClick={() => openAuthModal("signup")}>
                    <User className="w-4 h-4 mr-2" />
                    Inscription
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              style={{ color: 'hsl(38 33% 93%)' }}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t animate-slide-up" style={{ borderColor: 'hsl(38 33% 93% / 0.15)' }}>
              <div className="flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 w-full">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher une annonce..."
                      className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </form>
                <Link to="/premium" className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5" style={{ color: 'hsl(36 62% 58%)' }}>
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
                      <Button size="sm" style={{ backgroundColor: 'hsl(18 66% 47%)', color: 'hsl(38 33% 95%)' }} onClick={() => openAuthModal("signup")}>
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
      <div className="fixed top-16 left-0 right-0 z-40">
        <CategoryNav />
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
