import { motion } from "framer-motion";
import { Shield, Lock, CreditCard, CheckCircle } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Tes fonds sont protégés jusqu'à réception de l'article. Zéro risque.",
  },
  {
    icon: Lock,
    title: "Escrow Stripe",
    description: "L'argent est bloqué en sécurité. Le vendeur n'est payé qu'après ta validation.",
  },
  {
    icon: CreditCard,
    title: "Transactions tracées",
    description: "Chaque euro est suivi. Transparence totale sur les frais et commissions.",
  },
  {
    icon: CheckCircle,
    title: "Garantie satisfaction",
    description: "Un problème ? Notre équipe intervient pour trouver une solution équitable.",
  },
];

const TrustSection = () => {
  return (
    <section 
      className="py-32"
      style={{ backgroundColor: 'hsl(40 30% 85%)' }} // Bone
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p 
            className="text-sm uppercase tracking-widest font-medium mb-4"
            style={{ color: 'hsl(43 49% 58%)' }}
          >
            Confiance & Sécurité
          </p>
          <h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ 
              color: 'hsl(230 84% 14%)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Un panier à 200€ ?
            <br />
            <span className="italic">En toute confiance.</span>
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'hsl(230 50% 35%)' }}
          >
            Chaque transaction est protégée par notre système d'escrow. 
            Tu ne paies que quand tu es satisfait.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {trustPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(40 30% 90%)',
                  borderColor: 'hsl(230 15% 80%)'
                }}
              >
                <div 
                  className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(230 84% 14%)' }}
                >
                  <point.icon 
                    className="w-7 h-7" 
                    style={{ color: 'hsl(43 49% 58%)' }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ 
                      color: 'hsl(230 84% 14%)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}
                  >
                    {point.title}
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: 'hsl(230 50% 35%)' }}
                  >
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stripe badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p 
            className="text-sm font-medium mb-3"
            style={{ color: 'hsl(230 50% 45%)' }}
          >
            Paiements sécurisés par
          </p>
          <div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
            style={{ backgroundColor: 'hsl(230 84% 14%)' }}
          >
            <svg 
              className="h-6" 
              viewBox="0 0 60 25" 
              fill="none"
              style={{ color: 'hsl(40 30% 85%)' }}
            >
              <path 
                fill="currentColor" 
                d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.03 1.04-.06 1.48zm-8.1-2.75h4.53c0-1.67-.69-2.93-2.18-2.93-1.43 0-2.23 1.17-2.35 2.93zM36.95 5.6c1.42 0 2.51.23 3.3.58v3.68a5.34 5.34 0 0 0-2.85-.68c-2.07 0-3.15 1.26-3.15 3.9 0 2.6 1.21 3.79 3.15 3.79.86 0 1.96-.26 2.85-.68v3.68c-.82.35-1.88.58-3.3.58-4.17 0-6.83-2.84-6.83-7.37 0-4.5 2.73-7.48 6.83-7.48zM22 5.3c1.1 0 2 .26 2.85.68v3.91c-.86-.41-1.96-.68-2.85-.68-1.94 0-3.15 1.17-3.15 3.79 0 2.65 1.08 3.9 3.15 3.9.89 0 1.99-.27 2.85-.68v3.91c-.85.42-1.75.68-2.85.68-4.1 0-6.83-2.97-6.83-7.48 0-4.53 2.66-7.52 6.83-7.52zM5.97 5.6h4.13v14.2H5.97V5.6zM5.97.55h4.13v3.5H5.97V.55zM0 19.8V5.6h4.13v14.2H0z"
              />
            </svg>
            <span 
              className="text-sm font-semibold"
              style={{ color: 'hsl(40 30% 85%)' }}
            >
              Stripe
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
