import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Compass, CheckCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Tu publies ta recherche",
    description: "Décris l'objet, ton budget, et ajoute des photos d'inspiration.",
    details: {
      title: "Comment publier ta recherche ?",
      content: [
        "Décris précisément l'objet que tu recherches (marque, modèle, époque, état souhaité)",
        "Ajoute une ou plusieurs photos d'inspiration pour guider les chineurs",
        "Indique ton budget minimum et maximum",
        "Choisis la catégorie appropriée (Mode vintage, Vinyles, Pop culture, etc.)",
        "Précise le niveau d'urgence de ta recherche"
      ]
    }
  },
  {
    icon: Compass,
    step: "02",
    title: "Les chineurs partent à la chasse",
    description: "Notre communauté recherche en ligne et dans les brocantes, friperies, marchés.",
    details: {
      title: "Qui sont les chineurs ?",
      content: [
        "Des passionnés et experts dans leur domaine",
        "Ils parcourent brocantes, friperies, vide-greniers et marchés aux puces",
        "Ils ont accès à des réseaux et sources exclusives",
        "Chaque chineur a un profil avec ses spécialités et évaluations",
        "Tu peux réserver un chineur pour une recherche exclusive"
      ]
    }
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Tu valides la meilleure proposition",
    description: "Compare les offres et choisis celle qui te convient.",
    details: {
      title: "Comment fonctionnent les propositions ?",
      content: [
        "Reçois des notifications dès qu'un chineur trouve quelque chose",
        "Chaque proposition inclut des photos réelles et détaillées",
        "Compare les prix, l'état et les conditions de chaque trouvaille",
        "Communique directement avec le chineur via la messagerie",
        "Tu es libre d'accepter ou de refuser chaque proposition"
      ]
    }
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "La transaction est sécurisée",
    description: "Paiement sécurisé, protection acheteur incluse.",
    details: {
      title: "Comment se passe la transaction ?",
      content: [
        "Paiement 100% sécurisé via notre plateforme",
        "Les fonds sont bloqués jusqu'à réception et validation",
        "Livraison suivie avec numéro de tracking",
        "Tu disposes de 48h pour vérifier l'objet à réception",
        "Évalue le chineur pour aider la communauté"
      ]
    }
  },
];

const HowItWorks = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <section className="py-24 relative overflow-hidden bg-cream">
      {/* Warm texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-barlow font-medium uppercase tracking-wider text-accent">
            Simple et efficace
          </span>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mt-4 mb-6 text-foreground">
            Comment ça marche ?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-foreground/70">
            En 4 étapes, passe de "j'aimerais trouver" à "j'ai trouvé"
          </p>
        </motion.div>

        {/* Horizontal stepper */}
        <div className="relative">
          {/* Connector line - desktop only */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-accent/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative group cursor-pointer flex flex-col items-center text-center"
                onClick={() => setSelectedStep(index)}
              >
                {/* Step circle */}
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-300 border-4 border-accent bg-cream group-hover:scale-110 group-hover:bg-accent"
                  style={{ boxShadow: '0 4px 20px -4px hsl(var(--gold) / 0.25)' }}
                >
                  {/* Number */}
                  <span className="step-num text-2xl font-barlow font-bold absolute transition-all duration-300 text-accent group-hover:opacity-0 group-hover:scale-50">
                    {step.step}
                  </span>
                  {/* Icon */}
                  <step.icon className="step-icon w-9 h-9 absolute transition-all duration-300 text-accent opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 group-hover:text-cream" />
                </div>
                
                <h3 className="text-lg font-poppins font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-[220px] text-foreground/65">
                  {step.description}
                </p>
                
                {/* Click hint */}
                <div className="mt-3 text-xs font-barlow font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
                  <span>En savoir plus →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for step details */}
      <Dialog open={selectedStep !== null} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-md bg-cream border-accent/30">
          {selectedStep !== null && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/12">
                    {(() => {
                      const StepIcon = steps[selectedStep].icon;
                      return <StepIcon className="w-6 h-6 text-accent" />;
                    })()}
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-barlow font-bold bg-accent text-accent-foreground">
                    Étape {steps[selectedStep].step}
                  </span>
                </div>
                <DialogTitle className="text-xl font-poppins font-bold text-foreground">
                  {steps[selectedStep].details.title}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <ul className="space-y-3 mt-4">
                  {steps[selectedStep].details.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HowItWorks;
