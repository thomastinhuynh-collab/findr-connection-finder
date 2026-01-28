import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer 
      className="py-20"
      style={{ backgroundColor: 'hsl(230 84% 14%)' }} // Deep Cove
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-6">
              <span 
                className="text-3xl font-bold"
                style={{ 
                  color: 'hsl(40 30% 85%)',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                findr
              </span>
            </Link>
            <p 
              className="text-sm mb-8 leading-relaxed"
              style={{ color: 'hsl(40 30% 85% / 0.7)' }}
            >
              La première marketplace inversée. 
              Tu demandes, la communauté trouve.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: 'hsl(40 30% 85% / 0.1)',
                  color: 'hsl(40 30% 85%)'
                }}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: 'hsl(40 30% 85% / 0.1)',
                  color: 'hsl(40 30% 85%)'
                }}
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 
              className="font-bold mb-6 text-sm uppercase tracking-wider"
              style={{ color: 'hsl(43 49% 58%)' }}
            >
              Plateforme
            </h4>
            <ul className="space-y-4">
              {[
                { to: "/recherches", label: "Recherches actives" },
                { to: "/poster", label: "Poster une recherche" },
                { to: "/devenir-findr", label: "Devenir Findr" },
                { to: "/premium", label: "Findr Premium" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'hsl(40 30% 85% / 0.7)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 
              className="font-bold mb-6 text-sm uppercase tracking-wider"
              style={{ color: 'hsl(43 49% 58%)' }}
            >
              Catégories
            </h4>
            <ul className="space-y-4">
              {[
                "Mode Vintage",
                "Pop Culture & TCG",
                "Vinyles & Musique",
                "Déco & Mobilier",
              ].map((category) => (
                <li key={category}>
                  <a 
                    href="#" 
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'hsl(40 30% 85% / 0.7)' }}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 
              className="font-bold mb-6 text-sm uppercase tracking-wider"
              style={{ color: 'hsl(43 49% 58%)' }}
            >
              Support
            </h4>
            <ul className="space-y-4">
              {[
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact" },
                { to: "/cgu", label: "CGU" },
                { to: "/confidentialite", label: "Confidentialité" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: 'hsl(40 30% 85% / 0.7)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div 
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid hsl(40 30% 85% / 0.1)' }}
        >
          <p 
            className="text-sm"
            style={{ color: 'hsl(40 30% 85% / 0.5)' }}
          >
            © 2025 Findr. Tous droits réservés.
          </p>
          <p 
            className="text-sm"
            style={{ color: 'hsl(40 30% 85% / 0.5)' }}
          >
            Fait avec ❤️ à Paris
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
