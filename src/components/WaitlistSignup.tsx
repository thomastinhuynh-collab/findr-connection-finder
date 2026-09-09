import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWaitlist } from "@/hooks/useWaitlist";

const WaitlistSignup = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"buyr" | "findr">("buyr");
  const { count, loading, submitted, submit } = useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit(email, role);
    if (ok) setEmail("");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(var(--navy-primary)) 0%, hsl(var(--navy-secondary)) 40%, hsl(var(--gold) / 0.6) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--cream)) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {count !== null && (
              <p className="text-sm text-cream/70 mb-4 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Déjà {count} personne{count !== 1 ? "s" : ""} sur la liste d'attente
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight text-cream">
              Sois parmi les premiers à rejoindre Findr
            </h2>
            <p className="text-base md:text-lg mb-8 text-cream/75">
              Lance-toi en avant-première et façonne la plateforme avec nous.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-accent/20">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <p className="text-xl font-semibold text-cream">
                  C'est noté ! On te prévient dès l'ouverture 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Role toggle */}
                <div>
                  <p className="text-sm text-cream/60 mb-3">Je suis plutôt...</p>
                  <div className="inline-flex rounded-full p-1 bg-cream/10 border border-cream/20">
                    <button
                      type="button"
                      onClick={() => setRole("buyr")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        role === "buyr"
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-cream/70 hover:text-cream"
                      }`}
                    >
                      🔍 Un buyr
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("findr")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        role === "findr"
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-cream/70 hover:text-cream"
                      }`}
                    >
                      🧭 Un findr
                    </button>
                  </div>
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/50" />
                    <Input
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 rounded-full text-base border-2 bg-cream/10 border-cream/25 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-14 px-8 rounded-full text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {loading ? "..." : "Rejoindre la liste d'attente"}
                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>

          {!submitted && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 text-sm flex items-center justify-center gap-1.5 text-cream/50"
            >
              <Lock className="w-3.5 h-3.5" />
              Pas de spam. Juste les vraies nouvelles de Findr.
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitlistSignup;
