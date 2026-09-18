import levisHero from "@/assets/blog/levis-vintage-hero.jpg";
import taillesHeroAsset from "@/assets/blog/hero-guide-tailles-vintage.jpg.asset.json";
import entretienHeroAsset from "@/assets/blog/hero-entretien-cuir-denim.jpg.asset.json";
import cartesHero from "@/assets/blog/cartes-pokemon-etat-rarete-hero.jpg";
import authentifierHero from "@/assets/blog/authentifier-carte-pokemon-hero.jpg";
import popCultureHeroAsset from "@/assets/blog/hero-objets-valeur-pop-culture.jpg.asset.json";

export type BlogContentBlock =
  | { type: "heading"; i18nKey: string }
  | { type: "paragraph"; i18nKey: string }
  | { type: "quote"; i18nKey: string }
  | { type: "glossary"; entries: GlossaryEntry[] };

export interface GlossaryEntry {
  termKey: string;
  abbreviationKey: string;
  descriptionKey: string;
}

export interface BlogPost {
  key: string;
  slug: string;
  i18nKey: string;
  categoryKey: "fashion" | "popCulture";
  categoryFilter: "Mode & Maroquinerie" | "Pop Culture & TCG";
  publishedAt: string;
  heroImage: string;
  content: BlogContentBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    key: "levis",
    slug: "comment-reconnaitre-vraie-piece-vintage-levis",
    i18nKey: "blog.posts.levis",
    categoryKey: "fashion",
    categoryFilter: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    heroImage: levisHero,
    content: [
      { type: "heading", i18nKey: "blog.posts.levis.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p1" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p2" },
      { type: "heading", i18nKey: "blog.posts.levis.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p3" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p4" },
      { type: "heading", i18nKey: "blog.posts.levis.content.h3" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p5" },
      { type: "heading", i18nKey: "blog.posts.levis.content.h4" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p6" },
      { type: "paragraph", i18nKey: "blog.posts.levis.content.p7" },
    ],
  },
  {
    key: "sizes",
    slug: "guide-tailles-vintage-m-annees-80",
    i18nKey: "blog.posts.sizes",
    categoryKey: "fashion",
    categoryFilter: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    heroImage: taillesHeroAsset.url,
    content: [
      { type: "heading", i18nKey: "blog.posts.sizes.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.sizes.content.p1" },
      { type: "paragraph", i18nKey: "blog.posts.sizes.content.p2" },
      { type: "heading", i18nKey: "blog.posts.sizes.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.sizes.content.p3" },
      { type: "paragraph", i18nKey: "blog.posts.sizes.content.p4" },
      { type: "paragraph", i18nKey: "blog.posts.sizes.content.p5" },
    ],
  },
  {
    key: "care",
    slug: "entretenir-cuir-denim-vintage",
    i18nKey: "blog.posts.care",
    categoryKey: "fashion",
    categoryFilter: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    heroImage: entretienHeroAsset.url,
    content: [
      { type: "heading", i18nKey: "blog.posts.care.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p1" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p2" },
      { type: "heading", i18nKey: "blog.posts.care.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p3" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p4" },
      { type: "heading", i18nKey: "blog.posts.care.content.h3" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p5" },
      { type: "heading", i18nKey: "blog.posts.care.content.h4" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p6" },
      { type: "paragraph", i18nKey: "blog.posts.care.content.p7" },
    ],
  },
  {
    key: "pokemonCondition",
    slug: "cartes-pokemon-etat-rarete",
    i18nKey: "blog.posts.pokemonCondition",
    categoryKey: "popCulture",
    categoryFilter: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    heroImage: cartesHero,
    content: [
      { type: "heading", i18nKey: "blog.posts.pokemonCondition.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p1" },
      { type: "heading", i18nKey: "blog.posts.pokemonCondition.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p2" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p3" },
      { type: "heading", i18nKey: "blog.posts.pokemonCondition.content.h3" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p4" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p5" },
      { type: "heading", i18nKey: "blog.posts.pokemonCondition.content.h4" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p6" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p7" },
      { type: "heading", i18nKey: "blog.posts.pokemonCondition.content.h5" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonCondition.content.p8" },
      {
        type: "glossary",
        entries: [
          { termKey: "blog.posts.pokemonCondition.glossary.mint.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.mint.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.mint.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.nearMint.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.nearMint.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.nearMint.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.excellent.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.excellent.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.excellent.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.good.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.good.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.good.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.lightlyPlayed.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.lightlyPlayed.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.lightlyPlayed.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.played.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.played.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.played.description" },
          { termKey: "blog.posts.pokemonCondition.glossary.poor.term", abbreviationKey: "blog.posts.pokemonCondition.glossary.poor.abbreviation", descriptionKey: "blog.posts.pokemonCondition.glossary.poor.description" },
        ],
      },
    ],
  },
  {
    key: "pokemonAuth",
    slug: "authentifier-carte-pokemon-rare",
    i18nKey: "blog.posts.pokemonAuth",
    categoryKey: "popCulture",
    categoryFilter: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    heroImage: authentifierHero,
    content: [
      { type: "heading", i18nKey: "blog.posts.pokemonAuth.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p1" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p2" },
      { type: "heading", i18nKey: "blog.posts.pokemonAuth.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p3" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p4" },
      { type: "heading", i18nKey: "blog.posts.pokemonAuth.content.h3" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p5" },
      { type: "heading", i18nKey: "blog.posts.pokemonAuth.content.h4" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p6" },
      { type: "paragraph", i18nKey: "blog.posts.pokemonAuth.content.p7" },
    ],
  },
  {
    key: "popCultureValue",
    slug: "pop-culture-vintage-objets-valeur",
    i18nKey: "blog.posts.popCultureValue",
    categoryKey: "popCulture",
    categoryFilter: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    heroImage: popCultureHeroAsset.url,
    content: [
      { type: "heading", i18nKey: "blog.posts.popCultureValue.content.h1" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p1" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p2" },
      { type: "heading", i18nKey: "blog.posts.popCultureValue.content.h2" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p3" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p4" },
      { type: "heading", i18nKey: "blog.posts.popCultureValue.content.h3" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p5" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p6" },
      { type: "heading", i18nKey: "blog.posts.popCultureValue.content.h4" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p7" },
      { type: "paragraph", i18nKey: "blog.posts.popCultureValue.content.p8" },
    ],
  },
];
export const getBlogPostBySlug = (slug: string | undefined): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);
