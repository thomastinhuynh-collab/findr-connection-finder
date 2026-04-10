import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import Logo from "@/components/Logo";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.69h-1z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <Logo size="lg" variant="dark" />
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              La marketplace inversée du vintage.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Plateforme</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/comment-ca-marche" className="hover:text-primary transition-colors">Comment ça marche</Link></li>
              <li><Link to="/recherches" className="hover:text-primary transition-colors">Je chine</Link></li>
              <li><Link to="/poster" className="hover:text-primary transition-colors">Je cherche</Link></li>
              <li><Link to="/premium" className="hover:text-primary transition-colors">findr Premium</Link></li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Catégories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Mode Vintage</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pop Culture & TCG</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vinyles & Musique</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Déco & Mobilier</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Légal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 findr. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in France
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
