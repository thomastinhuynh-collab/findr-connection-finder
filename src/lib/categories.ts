export type CategoryStatus = "active" | "coming_soon";

export interface CategorySub {
  name: string;
}

export interface Category {
  name: string;
  slug: string;
  status: CategoryStatus;
  subcategories: CategorySub[];
}

/**
 * Source unique de vérité des catégories findr.
 * Les catégories "coming_soon" restent visibles mais ne sont pas sélectionnables
 * (page dédiée "Bientôt disponible" côté listing, options désactivées côté formulaires).
 */
export const CATEGORIES: Category[] = [
  {
    name: "Mode & Maroquinerie",
    slug: "Mode & Maroquinerie",
    status: "active",
    subcategories: [
      { name: "Vestes & Manteaux" },
      { name: "T-shirts & Sweats" },
      { name: "Pantalons & Jeans" },
      { name: "Robes & Jupes" },
      { name: "Chaussures" },
      { name: "Sportswear" },
    ],
  },
  {
    name: "Pop Culture & TCG",
    slug: "Pop Culture & TCG",
    status: "active",
    subcategories: [
      { name: "Cartes Pokémon" },
      { name: "Cartes Yu-Gi-Oh!" },
      { name: "Cartes Magic" },
      { name: "Figurines & Jouets" },
      { name: "Mangas & Comics" },
      { name: "Jeux vidéo rétro" },
    ],
  },
  {
    name: "Vinyles & Musique",
    slug: "Vinyles & Musique",
    status: "coming_soon",
    subcategories: [
      { name: "Vinyles 33 tours" },
      { name: "Vinyles 45 tours" },
      { name: "Cassettes" },
      { name: "CD collectors" },
      { name: "Platines & Hi-Fi" },
    ],
  },
  {
    name: "Photo & Électronique",
    slug: "Photo & Électronique",
    status: "coming_soon",
    subcategories: [
      { name: "Appareils argentiques" },
      { name: "Objectifs vintage" },
      { name: "Accessoires photo" },
      { name: "Consoles rétro" },
      { name: "Audio vintage" },
    ],
  },
  {
    name: "Bijoux & Accessoires",
    slug: "Bijoux & Accessoires",
    status: "coming_soon",
    subcategories: [
      { name: "Bagues & Bracelets" },
      { name: "Colliers & Pendentifs" },
      { name: "Montres vintage" },
      { name: "Sacs & Pochettes" },
      { name: "Lunettes" },
    ],
  },
  {
    name: "Déco & Mobilier",
    slug: "Déco & Mobilier",
    status: "coming_soon",
    subcategories: [
      { name: "Meubles vintage" },
      { name: "Luminaires" },
      { name: "Objets déco" },
      { name: "Vaisselle & Céramique" },
      { name: "Textile maison" },
    ],
  },
];

/** Catégorie fourre-tout utilisée dans les formulaires de publication/édition. */
export const OTHER_CATEGORY = "Autre";

export const getCategoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug || c.name === slug);

export const isComingSoonCategory = (slug: string): boolean =>
  getCategoryBySlug(slug)?.status === "coming_soon";

export const isActiveCategory = (slug: string): boolean =>
  getCategoryBySlug(slug)?.status === "active";
