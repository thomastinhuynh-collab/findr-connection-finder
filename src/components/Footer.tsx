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
    <footer className="bg-navy-primary border-t border-secondary/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-2">
              <Logo size="lg" variant="light" />
            </Link>
            <p className="text-cream/40 text-xs italic mb-4">
              let others search for you
            </p>
            <p className="text-cream/60 text-sm mb-6">
              La marketplace inversée du vintage.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-cream/70 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-cream/70 hover:bg-accent hover:text-accent-foreground transition-colors">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="font-poppins font-semibold text-cream mb-4">Plateforme</h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li><Link to="/comment-ca-marche" className="hover:text-accent transition-colors">Comment ça marche</Link></li>
              <li><Link to="/recherches" className="hover:text-accent transition-colors">Je deviens findr</Link></li>
              <li><Link to="/poster" className="hover:text-accent transition-colors">Je deviens buyr</Link></li>
              <li><Link to="/premium" className="hover:text-accent transition-colors">findr Premium</Link></li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-poppins font-semibold text-cream mb-4">Catégories</h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li><a href="#" className="hover:text-accent transition-colors">Mode Vintage</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Pop Culture & TCG</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Vinyles & Musique</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Déco & Mobilier</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-poppins font-semibold text-cream mb-4">Légal</h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li><Link to="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-accent transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-secondary/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-cream/50">
            © 2025 findr. Tous droits réservés.
          </p>
          <p className="text-sm text-cream/50">
            Made with ❤️ in France
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
