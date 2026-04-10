import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <Logo size="lg" variant="dark" showTagline />
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              La première plateforme communautaire de chinage collaboratif. 
              Tu demandes, la communauté trouve.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Plateforme</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/recherches" className="hover:text-primary transition-colors">Recherches actives</Link></li>
              <li><Link to="/poster" className="hover:text-primary transition-colors">Poster une recherche</Link></li>
              <li><Link to="/devenir-findr" className="hover:text-primary transition-colors">Devenir findr</Link></li>
              <li><Link to="/premium" className="hover:text-primary transition-colors">findr Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Catégories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Mode Vintage</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pop Culture & TCG</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vinyles & Musique</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Déco & Mobilier</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 findr. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground">
            Fait avec ❤️ à Paris
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
