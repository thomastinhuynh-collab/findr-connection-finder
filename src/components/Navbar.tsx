import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import CategoryNav from "@/components/CategoryNav";

const navLinks = [
  { label: "Comment ça marche", to: "/comment-ca-marche" },
  { label: "Je deviens buyr", to: "/poster" },
  { label: "Je deviens findr", to: "/recherches" },
  { label: "Blog", to: "/blog" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-secondary/30 shadow-sm bg-navy-primary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group ml-8">
              <Logo size="lg" variant="light" />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-cream/80 hover:text-cream transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center">
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-poppins font-semibold rounded-full"
                onClick={() => setAuthModalOpen(true)}
              >
                Rejoindre la beta
              </Button>
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
