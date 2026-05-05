import { Star, Lock, ShieldCheck, BadgeCheck, Users } from "lucide-react";
import { useScrollReveal, useScrollRevealGroup } from "@/hooks/useScrollReveal";
import { useEffect, useRef, useState } from "react";
import { useWaitlist } from "@/hooks/useWaitlist";

const guarantees = [
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: ShieldCheck, label: "Protection buyr" },
  { icon: BadgeCheck, label: "Communauté vérifiée" },
];

const testimonials = [
  {
    quote: "J'ai trouvé ma veste Levi's 70s en 3 jours grâce à un findr de Lille. Exactement ce que je cherchais depuis des mois !",
    author: "Camille Dupont",
    role: "buyr",
    avatar: "https://i.pravatar.cc/60?img=5",
    rating: 5,
  },
  {
    quote: "Je déniche depuis toujours dans les brocantes. Maintenant je suis payé pour le faire. Le concept est génial !",
    author: "Antoine Marchand",
    role: "findr",
    avatar: "https://i.pravatar.cc/60?img=12",
    rating: 5,
  },
  {
    quote: "Carte Pokémon 1ère édition, état mint. Le findr l'a dénichée à un vide-grenier pour 30€. Je n'y croyais pas.",
    author: "Julien Renard",
    role: "buyr",
    avatar: "https://i.pravatar.cc/60?img=8",
    rating: 5,
  },
];

const WAITLIST_COUNT = 1_247;
const WAITLIST_GOAL = 2_000;

const Testimonials = () => {
  const guaranteesRef = useScrollReveal();
  const headingRef = useScrollReveal();
  const cardsRef = useScrollRevealGroup();
  const waitlistRef = useScrollReveal();
  const progressRef = useRef<HTMLDivElement>(null);
  const [progressRevealed, setProgressRevealed] = useState(false);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProgressRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-14 bg-cream">
      <div className="container mx-auto px-4">

        {/* Guarantees badges */}
        <div ref={guaranteesRef} className="scroll-reveal flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-7">
          {guarantees.map((g, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full border border-foreground/12 bg-background">
              <g.icon className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-foreground">{g.label}</span>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div ref={headingRef} className="scroll-reveal text-center mb-7">
          <span className="text-sm font-barlow font-medium uppercase tracking-wider text-accent">
            Témoignages
          </span>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mt-4 text-foreground">
            Ce qu'ils disent de findr
          </h2>
        </div>

        {/* Testimonial cards */}
        <div ref={cardsRef} className="stagger-group grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="stagger-item rounded-2xl p-7 border border-foreground/8 bg-background"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6 text-foreground/80">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.author} loading="lazy" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.author}</p>
                  <p className="text-xs text-foreground/50">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist counter */}
        <div ref={waitlistRef} className="scroll-reveal max-w-lg mx-auto rounded-2xl p-8 border border-secondary/40 text-center bg-navy-primary">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-sm font-barlow font-medium text-cream/70">Liste d'attente</span>
          </div>

          <p className="text-2xl md:text-3xl font-poppins font-bold mb-1 text-cream">
            Déjà {WAITLIST_COUNT.toLocaleString('fr-FR')} curieux inscrits
          </p>
          <p className="text-xs mb-5 text-cream/50">
            Objectif : {WAITLIST_GOAL.toLocaleString('fr-FR')} inscrits
          </p>

          {/* Progress bar */}
          <div ref={progressRef} className="h-3 rounded-full overflow-hidden bg-cream/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-1000 ease-out"
              style={{ width: progressRevealed ? `${(WAITLIST_COUNT / WAITLIST_GOAL) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
