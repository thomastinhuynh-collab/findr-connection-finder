import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Users } from "lucide-react";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useWaitlist } from "@/hooks/useWaitlist";
import heroImage from "@/assets/hero-vintage.jpg";

const CallToAction = () => {
  const [email, setEmail] = useState("");
  const sectionRef = useScrollReveal();
  const { count, loading, submitted, submit } = useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit(email);
    if (ok) setEmail("");
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className="scroll-reveal relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Brocante vintage"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/85" />
          </div>

          <div className="relative z-10 py-20 px-8 md:px-16 text-center">
            {count !== null && (
              <p className="text-sm mb-4 flex items-center justify-center gap-2" style={{ color: 'hsl(42 33% 94% / 0.7)' }}>
                <Users className="w-4 h-4" />
                Déjà {count} personne{count !== 1 ? "s" : ""} sur la liste d'attente
              </p>
            )}
            <h2 className="text-3xl md:text-5xl font-barlow font-bold mb-6" style={{ color: 'hsl(42 33% 94%)' }}>
              Prêt à trouver tes pépites ?
            </h2>
            <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: 'hsl(42 33% 94% / 0.85)' }}>
              Rejoins la liste d'attente et sois parmi les premiers 
              à accéder à la plateforme de chinage communautaire.
            </p>

            {submitted ? (
              <p className="text-xl font-semibold" style={{ color: 'hsl(42 33% 94%)' }}>
                🎉 C'est noté ! On te prévient dès l'ouverture.
              </p>
            ) : (
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    className="w-full h-14 pl-12 pr-4 rounded-full bg-secondary text-primary placeholder:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg" 
                  disabled={loading}
                  className="cta-hover btn-gold h-14 px-8 rounded-full whitespace-nowrap"
                >
                  {loading ? "..." : "Je m'inscris"}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
