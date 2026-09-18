# Plan — Blog findr, lot 1

## Objectif
Créer une vraie section Blog avec une page `/blog` et les 6 premiers articles fournis, sans reformuler les textes.

## Ce qui sera ajouté
- Une source de contenu centralisée pour les articles : titre, slug, catégorie, date, image, temps de lecture, description SEO et contenu structuré.
- Une page liste `/blog` présentant les 6 fiches articles.
- Un composant réutilisable `BlogArticle` pour toutes les pages `/blog/:slug`.
- Les routes `/blog` et `/blog/:slug` dans l’application.
- Les 6 URLs d’articles dans le sitemap.

## Mise en page des articles
- Image hero pleine largeur en ratio 16:9 avec titre en surimpression en bas.
- Fil d’Ariane : Blog > Catégorie > Titre.
- Date de publication et temps de lecture estimé.
- Corps en deux colonnes sur desktop avec un encart latéral sticky “Tu cherches ce genre d’objet ?”.
- Sous-titres Playfair Display, texte Inter.
- Citations mises en avant avec Playfair italique et filet doré.
- CTA final : “Poster une recherche” et “Devenir findr”.

## Glossaire Pokémon
Pour l’article “Cartes Pokémon : comment vérifier l’état et la rareté”, le glossaire sera rendu comme une liste éditoriale, pas comme un tableau : terme en Inter 600, abréviation dorée, description grise, séparateurs fins et espacement vertical.

## Images
Comme aucun visuel spécifique d’article n’a été fourni, j’utiliserai les assets existants du projet pour rester cohérent avec la charte, sans hotlink externe.

## Technique
- Utilisation de `usePageMeta` pour chaque article.
- Réutilisation des composants existants, notamment `Button`.
- Aucune icône de bibliothèque pour cette section.
- Aucun changement de logique métier.
