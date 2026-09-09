import LegalLayout from "./LegalLayout";

const LegalNotice = () => (
  <LegalLayout title="Mentions légales">
    <h2>Éditeur du site</h2>
    <p>
      Le site <strong>findr</strong> (ci-après « la Plateforme ») est édité par findr SAS,
      société par actions simplifiée en cours d'immatriculation au Registre du Commerce
      et des Sociétés.
    </p>
    <ul>
      <li><strong>Dénomination sociale :</strong> findr SAS</li>
      <li><strong>Siège social :</strong> France</li>
      <li><strong>Email de contact :</strong> contact@findrapp.fr</li>
      <li><strong>Directeur de la publication :</strong> Le représentant légal de findr SAS</li>
    </ul>

    <h2>Hébergement</h2>
    <p>
      Le site est hébergé par <strong>Lovable Labs Incorporated</strong> et utilise
      les services d'infrastructure cloud associés (Supabase pour la base de
      données et l'authentification).
    </p>
    <ul>
      <li><strong>Raison sociale :</strong> Lovable Labs Incorporated</li>
      <li><strong>Adresse postale :</strong> One Lincoln Street, Suite 2500, Boston, MA 02111, États-Unis</li>
      <li><strong>Téléphone :</strong> +1 (323) 719-0419</li>
      <li><strong>Email :</strong> <a href="mailto:support@lovable.dev">support@lovable.dev</a></li>
    </ul>

    <h2>Propriété intellectuelle</h2>
    <p>
      L'ensemble des éléments du site (textes, graphismes, logo, icônes, images,
      ainsi que leur mise en forme) sont la propriété exclusive de findr SAS, à
      l'exception des contenus publiés par les utilisateurs. Toute reproduction,
      représentation, modification ou exploitation, totale ou partielle, sans
      autorisation écrite préalable est strictement interdite.
    </p>

    <h2>Responsabilité</h2>
    <p>
      findr met tout en œuvre pour assurer l'exactitude et la mise à jour des
      informations diffusées sur la Plateforme. Toutefois, findr ne saurait être
      tenue responsable des erreurs ou omissions, ni de l'utilisation faite de ces
      informations par des tiers.
    </p>

    <h2>Contact</h2>
    <p>
      Pour toute question relative aux présentes mentions légales, vous pouvez
      nous écrire à <a href="mailto:contact@findrapp.fr">contact@findrapp.fr</a>.
    </p>
  </LegalLayout>
);

export default LegalNotice;
