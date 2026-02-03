import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Package, CheckCircle, X } from "lucide-react";
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
    title: "Poste ta recherche",
    description: "Décris ce que tu cherches : veste vintage, carte Pokémon, vinyle rare... Ajoute une photo d'inspiration et ton budget.",
    details: {
      title: "Comment poster ta recherche ?",
      content: [
        "Décris précisément l'objet que tu recherches (marque, modèle, époque, état souhaité)",
        "Ajoute une ou plusieurs photos d'inspiration pour guider les findrs",
        "Indique ton budget minimum et maximum",
        "Choisis la catégorie appropriée (Mode vintage, Vinyles, Pop culture, etc.)",
        "Précise le niveau d'urgence de ta recherche"
      ]
    }
  },
  {
    icon: Users,
    step: "02",
    title: "Les Findrs cherchent",
    description: "Notre communauté de chineurs passionnés se met en quête. Brocantes, friperies, Vinted... Ils scrutent partout.",
    details: {
      title: "Qui sont les Findrs ?",
      content: [
        "Des chineurs passionnés et experts dans leur domaine",
        "Ils parcourent brocantes, friperies, vide-greniers et marchés aux puces",
        "Ils ont accès à des réseaux et sources exclusives",
        "Chaque findr a un profil avec ses spécialités et évaluations",
        "Tu peux réserver un findr pour une recherche exclusive"
      ]
    }
  },
  {
    icon: Package,
    step: "03",
    title: "Reçois des propositions",
    description: "Compare les trouvailles proposées. Prix, état, photos réelles. Choisis celle qui te correspond.",
    details: {
      title: "Comment fonctionnent les propositions ?",
      content: [
        "Reçois des notifications dès qu'un findr trouve quelque chose",
        "Chaque proposition inclut des photos réelles et détaillées",
        "Compare les prix, l'état et les conditions de chaque trouvaille",
        "Communique directement avec le findr via la messagerie intégrée",
        "Tu es libre d'accepter ou de refuser chaque proposition"
      ]
    }
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Valide et reçois",
    description: "Paiement sécurisé, livraison suivie. Le Findr envoie, tu reçois ta pépite. Simple comme bonjour.",
    details: {
      title: "Comment se passe la transaction ?",
      content: [
        "Paiement 100% sécurisé via notre plateforme",
        "Les fonds sont bloqués jusqu'à réception et validation",
        "Livraison suivie avec numéro de tracking",
        "Tu disposes de 48h pour vérifier l'objet à réception",
        "Évalue le findr pour aider la communauté"
      ]
    }
  },
];

const HowItWorks = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: 'hsl(224 67% 19%)' }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, hsl(222 37% 55% / 0.3) 0%, transparent 50%, hsl(38 52% 69% / 0.1) 100%)'
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
          <span 
            className="text-sm font-barlow font-medium uppercase tracking-wider"
            style={{ color: 'hsl(38 52% 69%)' }}
          >
            Le processus
          </span>
          <h2 
            className="text-3xl md:text-5xl font-barlow font-bold mt-4 mb-6"
            style={{ color: 'hsl(42 33% 94%)' }}
          >
            Comment ça marche ?
          </h2>
          <p 
            className="max-w-2xl mx-auto text-lg"
            style={{ color: 'hsl(42 33% 94% / 0.8)' }}
          >
            En 4 étapes, passe de "j'aimerais trouver" à "j'ai trouvé"
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedStep(index)}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden lg:block absolute top-12 left-[60%] w-full h-px transition-colors"
                  style={{ backgroundColor: 'hsl(42 33% 94% / 0.2)' }}
                />
              )}
              
              <div 
                className="relative rounded-2xl p-6 transition-all duration-300 border-2"
                style={{ 
                  backgroundColor: 'hsl(42 33% 94%)',
                  borderColor: 'transparent',
                  boxShadow: '0 4px 20px -4px hsl(224 67% 19% / 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(38 52% 69%)';
                  e.currentTarget.style.boxShadow = '0 8px 32px -4px hsl(38 52% 69% / 0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 4px 20px -4px hsl(224 67% 19% / 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Step number */}
                <span 
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full text-sm font-barlow font-bold flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'hsl(38 52% 69%)',
                    color: 'hsl(224 67% 19%)'
                  }}
                >
                  {step.step}
                </span>
                
                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: 'hsl(224 67% 19% / 0.1)' }}
                >
                  <step.icon className="w-7 h-7" style={{ color: 'hsl(224 67% 19%)' }} />
                </div>
                
                <h3 
                  className="text-xl font-barlow font-semibold mb-3"
                  style={{ color: 'hsl(224 67% 19%)' }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: 'hsl(224 67% 19% / 0.75)' }}
                >
                  {step.description}
                </p>
                
                {/* Click indicator */}
                <div 
                  className="mt-4 text-xs font-barlow font-medium flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'hsl(224 67% 19%)' }}
                >
                  <span>En savoir plus</span>
                  <span>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal for step details */}
      <Dialog open={selectedStep !== null} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent 
          className="max-w-md"
          style={{ 
            backgroundColor: 'hsl(42 33% 94%)',
            borderColor: 'hsl(38 52% 69%)'
          }}
        >
          {selectedStep !== null && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'hsl(224 67% 19% / 0.1)' }}
                  >
                    {(() => {
                      const StepIcon = steps[selectedStep].icon;
                      return <StepIcon className="w-6 h-6" style={{ color: 'hsl(224 67% 19%)' }} />;
                    })()}
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-barlow font-bold"
                    style={{ 
                      backgroundColor: 'hsl(38 52% 69%)',
                      color: 'hsl(224 67% 19%)'
                    }}
                  >
                    Étape {steps[selectedStep].step}
                  </span>
                </div>
                <DialogTitle 
                  className="text-xl font-barlow font-bold"
                  style={{ color: 'hsl(224 67% 19%)' }}
                >
                  {steps[selectedStep].details.title}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <ul className="space-y-3 mt-4">
                  {steps[selectedStep].details.content.map((item, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'hsl(224 67% 19% / 0.85)' }}
                    >
                      <CheckCircle 
                        className="w-5 h-5 flex-shrink-0 mt-0.5" 
                        style={{ color: 'hsl(38 52% 69%)' }} 
                      />
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
