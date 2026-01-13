import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "J'ai trouvé ma veste Levi's 70s en 3 jours grâce à un Findr de Lille. Exactement ce que je cherchais depuis des mois !",
    author: "Camille D.",
    role: "Buyr",
    avatar: "https://i.pravatar.cc/60?img=5",
    rating: 5,
  },
  {
    quote: "Je chine depuis toujours. Maintenant je suis payé pour le faire. C'est le job de rêve !",
    author: "Antoine M.",
    role: "Findr Expert",
    avatar: "https://i.pravatar.cc/60?img=12",
    rating: 5,
  },
  {
    quote: "Carte Pokémon 1ère édition, état mint. Le Findr l'a trouvée à une brocante à 30€. Incroyable.",
    author: "Julien R.",
    role: "Buyr",
    avatar: "https://i.pravatar.cc/60?img=8",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider">
            Témoignages
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-4 mb-6">
            Ce qu'ils disent de Findr
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-2xl p-8 shadow-vintage"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-primary">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
