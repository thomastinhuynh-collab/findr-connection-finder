import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Gem, Clock, ShieldCheck, Send, Coins, Heart, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const buyerBenefits = [
  { icon: Gem, text: "Trouvez des pièces introuvables" },
  { icon: Send, text: "Publiez gratuitement votre recherche" },
  { icon: Clock, text: "Recevez des propositions en 24h" },
  { icon: ShieldCheck, text: "Paiement 100% sécurisé" },
];

const finderBenefits = [
  { icon: Coins, text: "Monétise ton expertise" },
  { icon: Heart, text: "Choisis les recherches qui t'intéressent" },
  { icon: Calendar, text: "Travaille à ton rythme" },
  { icon: TrendingUp, text: "Construis ta réputation" },
];

const BecomeFindr = () => {
  return (
    <section className="py-24 relative overflow-hidden grain-texture" style={{ backgroundColor: 'hsl(38 33% 93%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-barlow font-medium uppercase tracking-wider" style={{ color: 'hsl(18 66% 47%)' }}>
            Deux profils, une communauté
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4" style={{ color: 'hsl(0 0% 10%)' }}>
            Quel est ton rôle ?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Buyer Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 md:p-10 flex flex-col border"
            style={{
              backgroundColor: 'hsl(0 0% 10%)',
              borderColor: 'hsl(0 0% 18%)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(18 66% 47% / 0.15)' }}>
              <Search className="w-7 h-7" style={{ color: 'hsl(18 66% 55%)' }} />
            </div>

            <h3 className="text-2xl font-serif font-bold mb-2" style={{ color: 'hsl(38 33% 93%)' }}>
              Tu cherches un objet rare
            </h3>
            <p className="text-sm mb-8" style={{ color: 'hsl(38 33% 93% / 0.55)' }}>
              Publie ta demande et laisse les chineurs trouver pour toi.
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {buyerBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(18 66% 47% / 0.12)' }}>
                    <b.icon className="w-4 h-4" style={{ color: 'hsl(18 66% 55%)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(38 33% 93% / 0.85)' }}>{b.text}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full text-base py-6 rounded-full font-semibold"
              style={{ backgroundColor: 'hsl(18 66% 47%)', color: 'hsl(38 33% 95%)' }}
              asChild
            >
              <Link to="/poster">
                Publier une recherche
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Finder Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 md:p-10 flex flex-col border"
            style={{
              backgroundColor: 'hsl(30 20% 94%)',
              borderColor: 'hsl(30 15% 82%)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(36 62% 58% / 0.15)' }}>
              <Heart className="w-7 h-7" style={{ color: 'hsl(36 62% 50%)' }} />
            </div>

            <h3 className="text-2xl font-serif font-bold mb-2" style={{ color: 'hsl(0 0% 10%)' }}>
              Tu es chineur ou passionné
            </h3>
            <p className="text-sm mb-8" style={{ color: 'hsl(0 0% 10% / 0.5)' }}>
              Transforme ta passion du chinage en source de revenus.
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {finderBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(36 62% 58% / 0.12)' }}>
                    <b.icon className="w-4 h-4" style={{ color: 'hsl(36 62% 50%)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(0 0% 10% / 0.8)' }}>{b.text}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-base py-6 rounded-full font-semibold border-2"
              style={{ borderColor: 'hsl(18 66% 47%)', color: 'hsl(18 66% 47%)', backgroundColor: 'transparent' }}
              asChild
            >
              <Link to="/recherches">
                Devenir chineur
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BecomeFindr;
