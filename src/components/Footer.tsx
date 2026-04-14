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
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Left - Brand */}
          <div>
            <Link to="/" className="block mb-2">
              <Logo />
            </Link>
            <p className="text-cream/70 text-sm italic mb-4">
              let others search for you
            </p>
            <p className="text-cream/70 text-sm">
              Made with ❤️ in France
            </p>
          </div>

          {/* Middle - Plateforme */}
          <div>
            <h4 className="font-poppins font-semibold text-cream mb-4">Plateforme</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li><Link to="/comment-ca-marche" className="hover:text-accent transition-colors">Comment ça marche</Link></li>
              <li><Link to="/poster" className="hover:text-accent transition-colors">Devenir buyr</Link></li>
              <li><Link to="/recherches" className="hover:text-accent transition-colors">Devenir findr</Link></li>
              <li><Link to="/recherches" className="hover:text-accent transition-colors">Les catégories</Link></li>
            </ul>
          </div>

          {/* Right - Légal */}
          <div>
            <h4 className="font-poppins font-semibold text-cream mb-4">Légal</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li><Link to="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-accent transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-secondary pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-cream/50">
            © 2025 findr — Tous droits réservés
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-cream/70 hover:text-accent transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-cream/70 hover:text-accent transition-colors">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
