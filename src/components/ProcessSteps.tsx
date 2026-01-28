import { motion } from "framer-motion";
import { PenLine, MessageSquare, Package } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PenLine,
    title: "Poste ta recherche",
    description: "Décris l'objet de tes rêves et fixe ton budget maximum. C'est gratuit et sans engagement.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Reçois des offres",
    description: "Les chineurs experts te proposent leurs trouvailles avec photos et prix. Compare en toute tranquillité.",
  },
  {
    number: "03",
    icon: Package,
    title: "Valide et reçois",
    description: "Choisis ta pépite, paie en sécurité. Le chineur expédie, tu reçois. Simple.",
  },
];

const ProcessSteps = () => {
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
            Comment ça marche
          </p>
          <h2 
            className="text-3xl md:text-5xl font-bold"
            style={{ 
              color: 'hsl(230 84% 14%)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Trois étapes, <span className="italic">c'est tout.</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div 
                    className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px"
                    style={{ backgroundColor: 'hsl(230 15% 75%)' }}
                  />
                )}

                {/* Step number */}
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: 'hsl(230 84% 14%)' }}
                >
                  <step.icon 
                    className="w-10 h-10" 
                    style={{ color: 'hsl(40 30% 85%)' }}
                  />
                  <span 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ 
                      backgroundColor: 'hsl(43 49% 58%)',
                      color: 'hsl(230 84% 14%)'
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ 
                    color: 'hsl(230 84% 14%)',
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-base leading-relaxed max-w-xs mx-auto"
                  style={{ color: 'hsl(230 50% 35%)' }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
