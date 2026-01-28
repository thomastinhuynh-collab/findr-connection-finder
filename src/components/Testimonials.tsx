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
            Témoignages
          </p>
          <h2 
            className="text-3xl md:text-5xl font-bold"
            style={{ 
              color: 'hsl(230 84% 14%)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Ce qu'ils disent <span className="italic">de Findr</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: 'hsl(40 30% 90%)',
                borderColor: 'hsl(230 15% 80%)'
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5" 
                    style={{ 
                      fill: 'hsl(43 49% 58%)',
                      color: 'hsl(43 49% 58%)'
                    }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p 
                className="mb-8 leading-relaxed text-base"
                style={{ color: 'hsl(230 50% 35%)' }}
              >
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
                  <p 
                    className="font-bold"
                    style={{ 
                      color: 'hsl(230 84% 14%)',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}
                  >
                    {testimonial.author}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(230 50% 45%)' }}
                  >
                    {testimonial.role}
                  </p>
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
