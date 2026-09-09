import LegalLayout from "./LegalLayout";

const Privacy = () => (
  <LegalLayout title="Politique de confidentialité">
    <p>
      La présente politique décrit comment findr collecte, utilise et protège
      vos données personnelles, conformément au Règlement Général sur la
      Protection des Données (RGPD) et à la loi Informatique et Libertés.
    </p>

    <h2>1. Responsable de traitement</h2>
    <p>
      Le responsable de traitement est findr SAS. Pour toute question, vous
      pouvez nous contacter à <a href="mailto:privacy@findrapp.fr">privacy@findrapp.fr</a>.
    </p>

    <h2>2. Données collectées</h2>
    <ul>
      <li><strong>Données d'identification :</strong> nom, prénom, email, mot de passe (chiffré).</li>
      <li><strong>Données de profil :</strong> photo, biographie, ville (optionnel).</li>
      <li><strong>Données d'utilisation :</strong> recherches publiées, propositions, messages, évaluations.</li>
      <li><strong>Données techniques :</strong> adresse IP, type de navigateur, logs de connexion.</li>
    </ul>

    <h2>3. Finalités</h2>
    <ul>
      <li>Permettre la mise en relation entre buyrs et findrs.</li>
      <li>Gérer votre compte et les transactions.</li>
      <li>Assurer la sécurité de la Plateforme et prévenir la fraude.</li>
      <li>Vous adresser des communications relatives au service.</li>
    </ul>

    <h2>4. Bases légales</h2>
    <p>
      Les traitements reposent sur l'exécution du contrat (CGU), votre
      consentement (communications marketing), et l'intérêt légitime de findr
      (sécurité, amélioration du service).
    </p>

    <h2>5. Durée de conservation</h2>
    <p>
      Les données sont conservées le temps nécessaire à la fourniture du
      service, et au maximum 3 ans après la dernière activité, sauf obligations
      légales de conservation plus longues (notamment comptables).
    </p>

    <h2>6. Destinataires</h2>
    <p>
      Vos données sont accessibles aux équipes findr habilitées et à nos
      sous-traitants techniques (hébergement, paiement) soumis à des obligations
      contractuelles strictes. Aucune donnée n'est revendue à des tiers.
    </p>

    <h2>7. Vos droits</h2>
    <p>
      Vous disposez d'un droit d'accès, de rectification, d'effacement, de
      portabilité, de limitation et d'opposition. Vous pouvez les exercer à
      <a href="mailto:privacy@findrapp.fr"> privacy@findrapp.fr</a>. Vous pouvez
      également introduire une réclamation auprès de la CNIL
      (<a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>).
    </p>

    <h2>8. Cookies</h2>
    <p>
      findr utilise uniquement des cookies strictement nécessaires au
      fonctionnement de la Plateforme (session, authentification). Aucun cookie
      publicitaire ou de traçage tiers n'est déposé sans votre consentement.
    </p>

    <h2>9. Sécurité</h2>
    <p>
      Nous mettons en œuvre des mesures techniques et organisationnelles
      appropriées (chiffrement, contrôle d'accès, sauvegardes) pour protéger vos
      données contre tout accès non autorisé, perte ou altération.
    </p>
  </LegalLayout>
);

export default Privacy;
