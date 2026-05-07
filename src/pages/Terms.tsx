import LegalLayout from "./LegalLayout";

const Terms = () => (
  <LegalLayout title="Conditions Générales d'Utilisation">
    <p>
      Les présentes Conditions Générales d'Utilisation (« CGU ») régissent
      l'utilisation de la plateforme findr, qui met en relation des utilisateurs
      souhaitant trouver un objet ou service (« buyrs ») avec des utilisateurs
      capables de les leur procurer (« findrs »).
    </p>

    <h2>1. Objet</h2>
    <p>
      findr est une plateforme de mise en relation. findr n'est ni vendeur, ni
      acheteur, ni intermédiaire commercial. Les transactions sont conclues
      directement entre buyrs et findrs, dans le cadre encadré par la Plateforme.
    </p>

    <h2>2. Inscription</h2>
    <p>
      L'inscription est gratuite et réservée aux personnes majeures disposant de
      la capacité juridique de contracter. L'utilisateur s'engage à fournir des
      informations exactes et à les maintenir à jour.
    </p>

    <h2>3. Fonctionnement de la mise en relation</h2>
    <ul>
      <li>Les buyrs publient une recherche décrivant l'objet/service souhaité.</li>
      <li>Les findrs envoient des propositions chiffrées.</li>
      <li>Le buyr peut accepter une proposition ; les fonds sont alors bloqués sur la Plateforme (escrow).</li>
      <li>Les fonds sont libérés au findr après confirmation de réception par le buyr.</li>
    </ul>

    <h2>4. Frais de service</h2>
    <p>
      findr applique une commission de <strong>5%</strong> sur chaque transaction
      réussie (réduite à <strong>3%</strong> pour les membres Premium), ainsi que
      des <strong>frais d'authentification de 3%</strong>. Les tarifs sont
      affichés clairement avant la validation de toute transaction.
    </p>

    <h2>5. Obligations des utilisateurs</h2>
    <ul>
      <li>Ne pas publier de contenu illicite, contrefaisant ou trompeur.</li>
      <li>Respecter les engagements pris dans le cadre d'une transaction.</li>
      <li>Communiquer exclusivement via la messagerie intégrée jusqu'à la conclusion de la transaction.</li>
    </ul>

    <h2>6. Suspension et résiliation</h2>
    <p>
      findr se réserve le droit de suspendre ou supprimer tout compte ne
      respectant pas les présentes CGU, sans préavis ni indemnité.
    </p>

    <h2>7. Responsabilité</h2>
    <p>
      findr agit en tant qu'intermédiaire technique. La responsabilité quant à
      la conformité, l'authenticité et la livraison des objets/services proposés
      incombe exclusivement au findr. Le buyr est responsable du paiement.
    </p>

    <h2>8. Données personnelles</h2>
    <p>
      Le traitement des données personnelles est décrit dans notre{" "}
      <a href="/confidentialite">Politique de confidentialité</a>.
    </p>

    <h2>9. Droit applicable</h2>
    <p>
      Les présentes CGU sont soumises au droit français. Tout litige relèvera
      des tribunaux compétents du ressort du siège social de findr, sous réserve
      des dispositions impératives applicables aux consommateurs.
    </p>
  </LegalLayout>
);

export default Terms;
