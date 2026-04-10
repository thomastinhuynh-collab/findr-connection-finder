import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="py-16 border-t" style={{ backgroundColor: 'hsl(0 0% 10%)', borderColor: 'hsl(0 0% 16%)' }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <Logo size="lg" variant="light" showTagline />
            </Link>
            <p className="text-sm mb-6" style={{ color: 'hsl(38 33% 93% / 0.5)' }}>
              La première plateforme communautaire de chinage collaboratif. 
              Tu demandes, la communauté trouve.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'hsl(38 33% 93% / 0.08)', color: 'hsl(38 33% 93% / 0.6)' }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'hsl(38 33% 93% / 0.08)', color: 'hsl(38 33% 93% / 0.6)' }}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'hsl(38 33% 93%)' }}>Plateforme</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'hsl(38 33% 93% / 0.5)' }}>
              <li><Link to="/recherches" className="hover:text-[hsl(18_66%_55%)] transition-colors">Recherches actives</Link></li>
              <li><Link to="/poster" className="hover:text-[hsl(18_66%_55%)] transition-colors">Poster une recherche</Link></li>
              <li><Link to="/devenir-findr" className="hover:text-[hsl(18_66%_55%)] transition-colors">Devenir chineur</Link></li>
              <li><Link to="/premium" className="hover:text-[hsl(18_66%_55%)] transition-colors">Findr Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'hsl(38 33% 93%)' }}>Catégories</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'hsl(38 33% 93% / 0.5)' }}>
              <li><a href="#" className="hover:text-[hsl(18_66%_55%)] transition-colors">Mode Vintage</a></li>
              <li><a href="#" className="hover:text-[hsl(18_66%_55%)] transition-colors">Pop Culture & TCG</a></li>
              <li><a href="#" className="hover:text-[hsl(18_66%_55%)] transition-colors">Vinyles & Musique</a></li>
              <li><a href="#" className="hover:text-[hsl(18_66%_55%)] transition-colors">Déco & Mobilier</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'hsl(38 33% 93%)' }}>Support</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'hsl(38 33% 93% / 0.5)' }}>
              <li><Link to="/faq" className="hover:text-[hsl(18_66%_55%)] transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[hsl(18_66%_55%)] transition-colors">Contact</Link></li>
              <li><Link to="/cgu" className="hover:text-[hsl(18_66%_55%)] transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-[hsl(18_66%_55%)] transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'hsl(38 33% 93% / 0.1)' }}>
          <p className="text-sm" style={{ color: 'hsl(38 33% 93% / 0.4)' }}>
            © 2025 findr. Tous droits réservés.
          </p>
          <p className="text-sm" style={{ color: 'hsl(38 33% 93% / 0.4)' }}>
            Fait avec ❤️ à Paris
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
