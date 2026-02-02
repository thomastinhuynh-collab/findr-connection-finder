import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-vintage.jpg";

const CallToAction = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Inscription réussie ! 🎉",
        description: "Tu seras notifié dès le lancement de findr.",
      });
      setEmail("");
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Brocante vintage"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/85" />
          </div>

          {/* Content */}
          <div className="relative z-10 py-20 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-5xl font-barlow font-bold mb-6" style={{ color: 'hsl(42 33% 94%)' }}>
              Prêt à trouver tes pépites ?
            </h2>
            <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: 'hsl(42 33% 94% / 0.85)' }}>
              Rejoins la liste d'attente et sois parmi les premiers 
              à accéder à la plateforme de chinage communautaire.
            </p>

            {/* Email Form */}
            <form 
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="w-full h-14 pl-12 pr-4 rounded-full bg-secondary text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="btn-gold h-14 px-8 rounded-full whitespace-nowrap"
              >
                Je m'inscris
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <p className="text-sm mt-6" style={{ color: 'hsl(42 33% 94% / 0.6)' }}>
              Pas de spam, promis. Juste des pépites. 💎
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
