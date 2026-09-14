# Compléter la traduction anglaise des blocs publics

## Objectif
Brancher uniquement les huit composants demandés sur le système i18next existant, sans modifier les composants déjà traduits.

## Modifications
- Ajouter `useTranslation()` dans `Footer`, `CategoryNav`, `ComingSoonCategory`, `Categories`, `CallToAction`, `Testimonials`, `WaitlistSignup` et `BecomeFindr`.
- Remplacer tous leurs textes visibles codés en dur par des clés `t(...)`, y compris libellés, appels à l’action, textes variables, placeholders et témoignages.
- Ajouter les mêmes clés dans les dictionnaires français et anglais.
- Conserver exactement le texte français actuel et rédiger un anglais naturel, direct et chaleureux.
- Utiliser la pluralisation i18next pour les compteurs de liste d’attente.

## Vérification
- Vérifier qu’aucun texte français visible ne reste codé en dur dans ces huit composants.
- Vérifier le typage et le rendu en français puis en anglais sur la page d’accueil.
