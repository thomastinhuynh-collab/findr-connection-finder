import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="findr-logo text-2xl text-primary">
            findr
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
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
            <Button variant="outline" size="sm">
              Connexion
            </Button>
            <Button size="sm" className="btn-hero">
              <User className="w-4 h-4 mr-2" />
              Inscription
            </Button>
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
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm">
                  Connexion
                </Button>
                <Button size="sm" className="btn-hero">
                  Inscription
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
