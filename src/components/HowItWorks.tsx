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
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-4 mb-6">
            Chiner n'a jamais été aussi simple
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-border group-hover:bg-accent transition-colors" />
              )}
              
              <div className="relative bg-background rounded-2xl p-6 shadow-vintage hover:shadow-glow transition-all duration-300 border border-border">
                {/* Step number */}
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-primary text-sm font-bold flex items-center justify-center">
                  {step.step}
                </span>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
