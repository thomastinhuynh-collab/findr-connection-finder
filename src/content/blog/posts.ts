import levisHero from "@/assets/blog/levis-vintage-hero.jpg";
import taillesHero from "@/assets/blog/tailles-vintage-hero.jpg";
import entretienHero from "@/assets/blog/entretien-cuir-denim-hero.jpg";
import cartesHero from "@/assets/blog/cartes-pokemon-etat-rarete-hero.jpg";
import authentifierHero from "@/assets/blog/authentifier-carte-pokemon-hero.jpg";
import popCultureHero from "@/assets/blog/pop-culture-valeur-hero.jpg";

export type BlogContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "glossary"; entries: GlossaryEntry[] };

export interface GlossaryEntry {
  term: string;
  abbreviation: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: "Mode & Maroquinerie" | "Pop Culture & TCG";
  publishedAt: string;
  readingTime: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  content: BlogContentBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "comment-reconnaitre-vraie-piece-vintage-levis",
    title: "Comment reconnaître une vraie pièce vintage Levi's",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "1 min de lecture",
    excerpt:
      "Étiquette, coutures, tissu, boutons et signaux qui peuvent clocher sur une annonce Levi's vintage.",
    heroImage: levisHero,
    heroAlt: "Veste en jean vintage sur cintre dans une lumière chaude",
    content: [
      { type: "heading", text: "Étiquette" },
      {
        type: "paragraph",
        text: "Big E majuscule avant milieu des années 70, numéro RN, « Made in USA » disparu vers les années 90.",
      },
      { type: "heading", text: "Coutures et tissu" },
      {
        type: "paragraph",
        text: "Selvedge.",
      },
      { type: "heading", text: "Boutons" },
      {
        type: "paragraph",
        text: "Marquage en creux, laiton d'époque.",
      },
      { type: "heading", text: "Ce qui peut clocher sur une annonce" },
      {
        type: "paragraph",
        text: "Rééditions vendues comme vintage, pièces reconstituées.",
      },
    ],
  },
  {
    slug: "guide-tailles-vintage-m-annees-80",
    title: "Guide des tailles vintage : pourquoi un \"M\" des années 80 n'est pas un \"M\" d'aujourd'hui",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "1 min de lecture",
    excerpt:
      "Vanity sizing, standards FR/UK/US différents et trois mesures à demander avant d'accepter.",
    heroImage: taillesHero,
    heroAlt: "Vêtements vintage pliés avec un mètre ruban",
    content: [
      { type: "heading", text: "Pourquoi un M vintage peut tailler différemment" },
      {
        type: "paragraph",
        text: "Vanity sizing, standards FR/UK/US différents.",
      },
      { type: "heading", text: "Les trois mesures à demander avant d'accepter" },
      {
        type: "paragraph",
        text: "Tour de poitrine à plat doublé, épaule à épaule, manche épaule à couture.",
      },
    ],
  },
  {
    slug: "entretenir-cuir-denim-vintage",
    title: "Comment entretenir et faire durer une pièce en cuir ou en denim vintage",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "1 min de lecture",
    excerpt:
      "Les bons gestes pour le cuir, le denim, le rangement et les réparations raisonnables.",
    heroImage: entretienHero,
    heroAlt: "Veste en cuir, denim et produits d'entretien sur une table en bois",
    content: [
      { type: "heading", text: "Cuir" },
      {
        type: "paragraph",
        text: "Chiffon humide, baume 1-2 fois/an, jamais de silicone, jamais de chaleur.",
      },
      { type: "heading", text: "Denim" },
      {
        type: "paragraph",
        text: "Lavage rare, eau froide, retourné, pas de sèche-linge.",
      },
      { type: "heading", text: "Rangement" },
      {
        type: "paragraph",
        text: "Lumière, humidité.",
      },
      { type: "heading", text: "Réparer jusqu'à un certain point" },
      {
        type: "paragraph",
        text: "Réparer jusqu'à un certain point.",
      },
    ],
  },
  {
    slug: "cartes-pokemon-etat-rarete",
    title: "Cartes Pokémon : comment vérifier l'état et la rareté avant d'acheter",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "2 min de lecture",
    excerpt:
      "Symboles de rareté, édition, extension, année d'impression et état visible sur photo.",
    heroImage: cartesHero,
    heroAlt: "Cartes de collection sous protection avec une loupe sur une table",
    content: [
      { type: "heading", text: "Symboles de rareté" },
      {
        type: "paragraph",
        text: "Cercle/comme, losange/peu commune, étoile/rare+holographique.",
      },
      { type: "heading", text: "Édition" },
      {
        type: "paragraph",
        text: "1st Edition, Shadowless.",
      },
      { type: "heading", text: "Symbole d'extension et année d'impression" },
      {
        type: "paragraph",
        text: "Symbole d'extension, année d'impression.",
      },
      { type: "heading", text: "État sur photo" },
      {
        type: "paragraph",
        text: "Coins, centrage, brillance hologramme, bords.",
      },
      {
        type: "glossary",
        entries: [
          { term: "Mint", abbreviation: "M", description: "État quasi parfait." },
          { term: "Near Mint", abbreviation: "NM", description: "État presque parfait." },
          { term: "Excellent", abbreviation: "EX", description: "Très bon état avec légère usure." },
          { term: "Good", abbreviation: "GD", description: "Bon état avec usure visible." },
          { term: "Lightly Played", abbreviation: "LP", description: "Légèrement joué." },
          { term: "Played", abbreviation: "PL", description: "Joué, usure marquée." },
          { term: "Poor", abbreviation: "PO", description: "Mauvais état." },
        ],
      },
    ],
  },
  {
    slug: "authentifier-carte-pokemon-rare",
    title: "Où et comment authentifier une carte Pokémon rare (guide débutant)",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "1 min de lecture",
    excerpt:
      "Test de la lumière, poids, texture, détails d'impression et œil d'un chineur expérimenté.",
    heroImage: authentifierHero,
    heroAlt: "Carte de collection inspectée à la loupe sous une lampe",
    content: [
      { type: "heading", text: "Test de la lumière" },
      {
        type: "paragraph",
        text: "Halo sombre entre les deux faces.",
      },
      { type: "heading", text: "Poids et texture" },
      {
        type: "paragraph",
        text: "Poids et texture.",
      },
      { type: "heading", text: "Détails d'impression" },
      {
        type: "paragraph",
        text: "Détails d'impression.",
      },
      { type: "heading", text: "L'œil d'un chineur expérimenté" },
      {
        type: "paragraph",
        text: "Un chineur expérimenté repère un problème en quelques secondes.",
      },
    ],
  },
  {
    slug: "pop-culture-vintage-objets-valeur",
    title: "Pop culture vintage : les objets qui prennent (vraiment) de la valeur",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "1 min de lecture",
    excerpt:
      "Rareté réelle, état, passion durable, consoles fonctionnelles et vrais budgets des buyrs.",
    heroImage: popCultureHero,
    heroAlt: "Objets pop culture vintage et collectibles rangés sur une étagère",
    content: [
      { type: "heading", text: "Rareté réelle vs « collector » marketing" },
      {
        type: "paragraph",
        text: "Rareté réelle vs « collector » marketing.",
      },
      { type: "heading", text: "L'état plus important que l'âge" },
      {
        type: "paragraph",
        text: "État plus important que l'âge (boîte d'origine).",
      },
      { type: "heading", text: "Mode qui passe vs passion qui reste" },
      {
        type: "paragraph",
        text: "Mode qui passe vs passion qui reste, consoles fonctionnelles.",
      },
      { type: "heading", text: "Le baromètre Findr" },
      {
        type: "paragraph",
        text: "Sur Findr, le baromètre est ce que les buyrs cherchent avec de vrais budgets.",
      },
    ],
  },
];
export const getBlogPostBySlug = (slug: string | undefined): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);
