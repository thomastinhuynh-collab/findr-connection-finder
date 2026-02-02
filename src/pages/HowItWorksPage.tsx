import { motion } from "framer-motion";
import { 
  Search, Users, Package, CheckCircle, Shield, Clock, 
  MessageSquare, Star, CreditCard, Handshake, AlertCircle,
  ArrowRight, UserCheck, ShoppingBag, Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-barlow font-bold mb-6" style={{ color: 'hsl(42 33% 94%)' }}>
              Comment ça marche ?
            </h1>
            <p className="text-lg md:text-xl" style={{ color: 'hsl(42 33% 94% / 0.85)' }}>
              Découvre le fonctionnement de findr, la plateforme de chinage collaboratif 
              qui connecte les chercheurs de trésors avec les dénicheurs passionnés.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Les Rôles Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Les acteurs
            </span>
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-primary mt-4">
              Deux rôles, une mission
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* buyr Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-2 border-accent/30 hover:border-accent transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 text-accent" />
                  </div>
                  <CardTitle className="text-2xl font-barlow text-primary">Le buyr</CardTitle>
                  <p className="text-muted-foreground">L'acheteur, le chercheur de trésors</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Poste une recherche</strong> détaillée avec photos d'inspiration et budget</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Reçoit des propositions</strong> de findrs qui ont trouvé l'objet</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Choisit la meilleure offre</strong> et valide l'achat en toute sécurité</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Évalue le findr</strong> après réception pour aider la communauté</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* findr Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-2 border-primary/30 hover:border-primary transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-barlow text-primary">Le findr</CardTitle>
                  <p className="text-muted-foreground">Le dénicheur, le chineur passionné</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Parcourt les recherches</strong> et identifie celles qu'il peut satisfaire</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Chine activement</strong> en brocantes, friperies, vide-greniers, en ligne...</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Fait une proposition</strong> avec photos, prix et description détaillée</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground"><strong>Gagne une commission</strong> sur chaque vente réussie</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Étapes du processus */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Le parcours
            </span>
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-primary mt-4">
              De la recherche à la réception
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "1",
                title: "Le buyr poste sa recherche",
                description: "Description détaillée de l'objet recherché, photos d'inspiration, fourchette de budget, niveau d'urgence. Plus la recherche est précise, plus les propositions seront pertinentes.",
                icon: Search,
                color: "bg-blue-500"
              },
              {
                step: "2",
                title: "Les findrs découvrent et réservent",
                description: "Les chineurs passionnés consultent les recherches. S'ils pensent pouvoir trouver l'objet, ils peuvent demander une réservation exclusive pour éviter la concurrence pendant leur recherche.",
                icon: Clock,
                color: "bg-purple-500"
              },
              {
                step: "3",
                title: "Le findr fait sa proposition",
                description: "Une fois l'objet trouvé, le findr soumet sa proposition avec photos réelles, prix proposé (incluant sa commission), description de l'état, et lien vers la source si applicable.",
                icon: Package,
                color: "bg-green-500"
              },
              {
                step: "4",
                title: "Négociation et validation",
                description: "Le buyr et le findr échangent via la messagerie intégrée. Le buyr peut demander des photos supplémentaires, négocier, ou valider directement la proposition.",
                icon: MessageSquare,
                color: "bg-orange-500"
              },
              {
                step: "5",
                title: "Paiement sécurisé",
                description: "Le buyr procède au paiement sécurisé. Les fonds sont conservés jusqu'à réception et validation de l'objet. Protection pour les deux parties.",
                icon: CreditCard,
                color: "bg-teal-500"
              },
              {
                step: "6",
                title: "Envoi et réception",
                description: "Le findr envoie l'objet avec suivi. À réception, le buyr confirme que tout est conforme. Les fonds sont alors libérés au findr.",
                icon: CheckCircle,
                color: "bg-emerald-500"
              },
              {
                step: "7",
                title: "Évaluation mutuelle",
                description: "Les deux parties s'évaluent mutuellement. Ces avis construisent la réputation et la confiance au sein de la communauté.",
                icon: Star,
                color: "bg-yellow-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold`}>
                  {item.step}
                </div>
                <div className="bg-background rounded-xl p-6 flex-1 shadow-sm border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-barlow font-semibold text-primary">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Système de réservation */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Fonctionnalité clé
            </span>
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-primary mt-4">
              Le système de réservation
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-accent/30">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-8 h-8 text-accent" />
                      <h3 className="text-xl font-barlow font-semibold text-primary">Pourquoi réserver ?</h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Éviter que plusieurs findrs cherchent le même objet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Investir du temps sereinement dans la recherche</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Montrer son engagement au buyr</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-primary" />
                      <h3 className="text-xl font-barlow font-semibold text-primary">Comment ça fonctionne ?</h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Le findr demande une réservation avec une durée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Le buyr approuve, modifie ou refuse la demande</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>La recherche devient exclusive pendant la durée</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Commissions */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Rémunération
            </span>
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-primary mt-4">
              Le système de commissions
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-barlow">Commission findr</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-barlow font-bold text-green-600 mb-4">10-30%</p>
                  <p className="text-muted-foreground">
                    Le findr fixe sa commission dans sa proposition. Elle est ajoutée au prix de l'objet trouvé.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full text-center border-2 border-accent">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-xl font-barlow">Frais findr</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-barlow font-bold text-accent mb-4">5%</p>
                  <p className="text-muted-foreground">
                    findr prélève une commission de 5% sur chaque transaction pour maintenir la plateforme et la sécurité.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-barlow">Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-barlow font-bold text-blue-600 mb-4">3%</p>
                  <p className="text-muted-foreground">
                    Les membres Premium bénéficient de frais réduits à 3% et d'avantages exclusifs.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <Card className="bg-secondary/50 border-none">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-barlow font-semibold text-primary mb-2">Exemple concret</h4>
                    <p className="text-muted-foreground">
                      Un findr trouve un vinyle rare à 50€. Il ajoute 20% de commission (10€). 
                      Le buyr paie donc 60€ + 5% de frais findr = <strong>63€ au total</strong>. 
                      Le findr reçoit 60€ - 5% = <strong>57€</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Savoir-vivre */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Notre communauté
            </span>
            <h2 className="text-3xl md:text-4xl font-barlow font-bold text-primary mt-4">
              Le savoir-vivre findr
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Pour que l'expérience soit agréable pour tous, quelques règles de bonne conduite.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Heart,
                title: "Respect et bienveillance",
                description: "Chaque membre mérite respect. Les échanges doivent rester courtois, même en cas de désaccord."
              },
              {
                icon: MessageSquare,
                title: "Communication claire",
                description: "Répondez aux messages dans un délai raisonnable (24-48h). Soyez précis dans vos descriptions."
              },
              {
                icon: Shield,
                title: "Honnêteté",
                description: "Décrivez fidèlement l'état des objets. Les mauvaises surprises nuisent à la confiance de tous."
              },
              {
                icon: Clock,
                title: "Ponctualité",
                description: "Respectez vos engagements : délais de réservation, d'envoi, de réponse. Prévenez en cas d'imprévu."
              },
              {
                icon: Star,
                title: "Évaluations justes",
                description: "Évaluez de manière constructive. Un avis négatif doit être justifié et factuel."
              },
              {
                icon: Handshake,
                title: "Pas de transactions externes",
                description: "Toutes les transactions doivent passer par findr pour garantir la protection de chacun."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-barlow font-semibold text-primary mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-barlow font-bold mb-6" style={{ color: 'hsl(42 33% 94%)' }}>
              Prêt à commencer ?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'hsl(42 33% 94% / 0.85)' }}>
              Rejoins la communauté findr et trouve tes pépites ou aide d'autres passionnés à trouver les leurs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="btn-gold px-8 py-6 rounded-full"
                asChild
              >
                <Link to="/poster">
                  Poster une recherche
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 rounded-full border-2"
                style={{ 
                  borderColor: 'hsl(42 33% 94%)',
                  color: 'hsl(42 33% 94%)',
                  backgroundColor: 'transparent'
                }}
                asChild
              >
                <Link to="/recherches">
                  Voir les recherches
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
