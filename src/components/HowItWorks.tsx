import { motion } from "framer-motion";
import { Search, Users, Package, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Poste ta recherche",
    description: "Décris ce que tu cherches : veste vintage, carte Pokémon, vinyle rare... Ajoute une photo d'inspiration et ton budget.",
  },
  {
    icon: Users,
    step: "02",
    title: "Les Findrs cherchent",
    description: "Notre communauté de chineurs passionnés se met en quête. Brocantes, friperies, Vinted... Ils scrutent partout.",
  },
  {
    icon: Package,
    step: "03",
    title: "Reçois des propositions",
    description: "Compare les trouvailles proposées. Prix, état, photos réelles. Choisis celle qui te correspond.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Valide et reçois",
    description: "Paiement sécurisé, livraison suivie. Le Findr envoie, tu reçois ta pépite. Simple comme bonjour.",
  },
];

const HowItWorks = () => {
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
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden lg:block absolute top-12 left-[60%] w-full h-px transition-colors"
                  style={{ backgroundColor: 'hsl(42 33% 94% / 0.2)' }}
                />
              )}
              
              <div 
                className="relative rounded-2xl p-6 transition-all duration-300 border"
                style={{ 
                  backgroundColor: 'hsl(42 33% 94%)',
                  borderColor: 'hsl(38 52% 69% / 0.3)',
                  boxShadow: '0 4px 20px -4px hsl(224 67% 19% / 0.3)'
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
