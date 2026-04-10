import { motion } from "framer-motion";
import { Star, Lock, ShieldCheck, BadgeCheck, Users } from "lucide-react";

const guarantees = [
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: ShieldCheck, label: "Protection acheteur" },
  { icon: BadgeCheck, label: "Communauté vérifiée" },
];

const testimonials = [
  {
    quote: "J'ai trouvé ma veste Levi's 70s en 3 jours grâce à un chineur de Lille. Exactement ce que je cherchais depuis des mois !",
    author: "Camille Dupont",
    role: "Chercheuse d'objets",
    avatar: "https://i.pravatar.cc/60?img=5",
    rating: 5,
  },
  {
    quote: "Je chine depuis toujours dans les brocantes. Maintenant je suis payé pour le faire. Le concept est génial !",
    author: "Antoine Marchand",
    role: "Chineur passionné",
    avatar: "https://i.pravatar.cc/60?img=12",
    rating: 5,
  },
  {
    quote: "Carte Pokémon 1ère édition, état mint. Le chineur l'a dénichée à un vide-grenier pour 30€. Je n'y croyais pas.",
    author: "Julien Renard",
    role: "Collectionneur",
    avatar: "https://i.pravatar.cc/60?img=8",
    rating: 5,
  },
];

const WAITLIST_COUNT = 1_247;
const WAITLIST_GOAL = 2_000;

const Testimonials = () => {
  return (
    <section className="py-24" style={{ backgroundColor: 'hsl(30 25% 95%)' }}>
      <div className="container mx-auto px-4">

        {/* Guarantees badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-16"
        >
          {guarantees.map((g, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: 'hsl(224 67% 19% / 0.12)', backgroundColor: 'hsl(42 33% 94%)' }}>
              <g.icon className="w-5 h-5" style={{ color: 'hsl(25 50% 45%)' }} />
              <span className="text-sm font-semibold" style={{ color: 'hsl(224 67% 19%)' }}>{g.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-barlow font-medium uppercase tracking-wider" style={{ color: 'hsl(25 50% 45%)' }}>
            Témoignages
          </span>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mt-4" style={{ color: 'hsl(224 67% 19%)' }}>
            Ce qu'ils disent de Findr
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl p-7 border"
              style={{ backgroundColor: 'hsl(42 33% 94%)', borderColor: 'hsl(224 67% 19% / 0.08)' }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ color: 'hsl(38 52% 69%)', fill: 'hsl(38 52% 69%)' }} />
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-6" style={{ color: 'hsl(224 67% 19% / 0.8)' }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.author} loading="lazy" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(224 67% 19%)' }}>{t.author}</p>
                  <p className="text-xs" style={{ color: 'hsl(224 67% 19% / 0.5)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Waitlist counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto rounded-2xl p-8 border text-center"
          style={{ backgroundColor: 'hsl(224 67% 19%)', borderColor: 'hsl(222 37% 36%)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-5 h-5" style={{ color: 'hsl(38 52% 69%)' }} />
            <span className="text-sm font-barlow font-medium" style={{ color: 'hsl(42 33% 94% / 0.7)' }}>Liste d'attente</span>
          </div>

          <p className="text-2xl md:text-3xl font-poppins font-bold mb-1" style={{ color: 'hsl(42 33% 94%)' }}>
            Déjà {WAITLIST_COUNT.toLocaleString('fr-FR')} curieux inscrits
          </p>
          <p className="text-xs mb-5" style={{ color: 'hsl(42 33% 94% / 0.5)' }}>
            Objectif : {WAITLIST_GOAL.toLocaleString('fr-FR')} inscrits
          </p>

          {/* Progress bar */}
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(42 33% 94% / 0.15)' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(WAITLIST_COUNT / WAITLIST_GOAL) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(38 52% 69%), hsl(25 50% 55%))' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
