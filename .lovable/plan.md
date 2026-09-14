# Traduction complète FR/EN du site

## Objectif
Quand l’utilisateur choisit l’anglais, toute l’interface passe en anglais. Les annonces et propositions sont automatiquement traduites, avec un lien permettant de revenir au texte original. Les messages privés, profils, évaluations et textes de litige restent dans leur langue d’origine.

## Interface complète
- Raccorder à i18next toutes les pages encore partiellement françaises : recherches, détail d’une recherche, publication et modification, propositions, espace personnel, messagerie, profils, évaluations, réservation, connexion, mot de passe, premium, erreurs et page introuvable.
- Traduire aussi les composants partagés : favoris, notifications, statuts, cartes, paiements, livraison, litiges, portefeuille et boutons de retour.
- Centraliser les libellés récurrents : catégories, délais, états, statuts, dates relatives, montants et messages d’erreur.
- Adapter les dates et pluriels à la langue active.
- Conserver l’administration interne en français, sauf les éléments visibles par les utilisateurs.

## Annonces et propositions
- Enregistrer la langue source lors de la création ou modification d’une annonce ou proposition.
- Ajouter un cache sécurisé de traductions FR/EN pour les titres et descriptions.
- Générer la traduction à la demande avec Lovable AI, puis la réutiliser afin d’éviter des appels répétés.
- Invalider automatiquement une traduction lorsque le texte original est modifié.
- Préserver les marques, modèles, noms propres, tailles, références et unités.
- Afficher la traduction dans les listes, les fiches, « Mon espace » et « Mes propositions ».
- Ajouter les mentions « Traduit automatiquement » et « Voir le texte original » / « Voir la traduction ».
- En cas d’indisponibilité de la traduction, afficher immédiatement le texte original sans bloquer la page, avec un message clair.

## Sécurité et données
- Créer deux tables dédiées aux traductions, avec lecture soumise aux mêmes règles que leurs contenus sources et écriture réservée au serveur.
- Activer RLS et accorder explicitement les droits nécessaires.
- Valider strictement les identifiants, la langue cible et les longueurs de texte dans la fonction de traduction.
- Ne jamais envoyer les messages privés, biographies, évaluations ou détails de litiges au service de traduction.
- Protéger la fonction contre les abus et les traitements en double.

## Vérification
- Tester un parcours complet en français puis en anglais : accueil, liste, fiche, création, proposition, espace personnel et paiement.
- Vérifier une annonce française en anglais et une annonce anglaise en français, ainsi que le retour au texte original.
- Tester la modification d’un texte pour confirmer que l’ancienne traduction n’est plus utilisée.
- Tester réellement l’appel Lovable AI avant validation finale.
