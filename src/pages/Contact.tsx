import LegalLayout from "./LegalLayout";
import { Mail, MessageCircle, Shield } from "lucide-react";

const Contact = () => (
  <LegalLayout title="Contact">
    <p>
      Une question, un retour, un signalement ? L'équipe findr est à votre
      écoute. Choisissez le canal le plus adapté à votre demande :
    </p>

    <div className="grid md:grid-cols-3 gap-4 not-prose mt-8">
      <a
        href="mailto:contact@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BD8B] hover:shadow-md transition-all"
      >
        <Mail className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-poppins font-semibold text-[#070E42] mb-1">Général</h3>
        <p className="text-sm text-[#070E42]/70">contact@findrapp.fr</p>
      </a>
      <a
        href="mailto:support@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BD8B] hover:shadow-md transition-all"
      >
        <MessageCircle className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-poppins font-semibold text-[#070E42] mb-1">Support</h3>
        <p className="text-sm text-[#070E42]/70">support@findrapp.fr</p>
      </a>
      <a
        href="mailto:privacy@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BD8B] hover:shadow-md transition-all"
      >
        <Shield className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-poppins font-semibold text-[#070E42] mb-1">Données / RGPD</h3>
        <p className="text-sm text-[#070E42]/70">privacy@findrapp.fr</p>
      </a>
    </div>

    <h2>Délai de réponse</h2>
    <p>
      Nous nous efforçons de répondre à toute demande sous 48 heures ouvrées.
      Pour les demandes liées à une transaction en cours, merci de préciser
      l'identifiant de la recherche concernée afin d'accélérer le traitement.
    </p>

    <h2>Signaler un contenu</h2>
    <p>
      Si vous repérez un contenu illicite, frauduleux ou contraire à nos CGU,
      écrivez-nous à <a href="mailto:support@findrapp.fr">support@findrapp.fr</a> en
      indiquant l'URL concernée et la nature du problème.
    </p>
  </LegalLayout>
);

export default Contact;
