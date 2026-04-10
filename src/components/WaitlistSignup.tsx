import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WaitlistSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Merci d'entrer une adresse email valide.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({ email: trimmed });
      if (error) {
        if (error.code === "23505") {
          toast.info("Tu es déjà inscrit(e) sur la liste d'attente !");
          setSubmitted(true);
        } else {
          toast.error("Une erreur est survenue. Réessaie plus tard.");
        }
      } else {
        setSubmitted(true);
      }
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden grain-texture">
      {/* Warm gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(0 0% 10%) 0%, hsl(18 30% 18%) 40%, hsl(18 50% 28%) 80%, hsl(18 66% 35%) 100%)`,
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
            <h2
              className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight"
              style={{ color: "hsl(38 33% 93%)" }}
            >
              Sois parmi les premiers à rejoindre Findr
            </h2>
            <p
              className="text-base md:text-lg mb-10"
              style={{ color: "hsl(38 33% 93% / 0.7)" }}
            >
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
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(128 15% 49% / 0.2)" }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: "hsl(128 15% 49%)" }} />
                </div>
                <p className="text-xl font-serif font-semibold" style={{ color: "hsl(38 33% 93%)" }}>
                  C'est noté ! On te prévient dès l'ouverture 🎉
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: "hsl(38 33% 93% / 0.45)" }}
                  />
                  <Input
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 rounded-full text-base border-2"
                    style={{
                      backgroundColor: "hsl(38 33% 93% / 0.08)",
                      borderColor: "hsl(38 33% 93% / 0.2)",
                      color: "hsl(38 33% 93%)",
                    }}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="h-14 px-8 rounded-full text-base font-semibold"
                  style={{
                    backgroundColor: "hsl(18 66% 47%)",
                    color: "hsl(38 33% 95%)",
                  }}
                >
                  {loading ? "..." : "Rejoindre la liste"}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            )}
          </motion.div>

          {!submitted && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 text-sm flex items-center justify-center gap-1.5"
              style={{ color: "hsl(38 33% 93% / 0.45)" }}
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
