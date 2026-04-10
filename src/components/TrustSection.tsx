import { motion } from "framer-motion";
import { Shield, Star, RefreshCw } from "lucide-react";

const guarantees = [
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Toutes les transactions sont protégées. Tu paies uniquement quand ta proposition est validée.",
  },
  {
    icon: Star,
    title: "findr vérifiés",
    description: "Les findr sont notés par la communauté. Seuls les meilleurs restent actifs sur la plateforme.",
  },
  {
    icon: RefreshCw,
    title: "Remboursement garanti",
    description: "L'objet ne correspond pas ? On te rembourse intégralement, sans question.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 bg-navy-primary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {guarantees.map((g, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-accent/15">
                <g.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-poppins font-bold mb-2 text-cream">
                {g.title}
              </h3>
              <p className="text-sm leading-relaxed text-cream/65 max-w-[280px]">
                {g.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-sm font-medium font-barlow tracking-wide text-accent"
        >
          ✦ Déjà 500+ personnes sur la liste d'attente
        </motion.p>
      </div>
    </section>
  );
};

export default TrustSection;
