import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { BlogContentBlock, BlogPost, GlossaryEntry } from "@/content/blog/posts";

interface BlogArticleProps {
  post: BlogPost;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const categoryHref = (category: string) => `/recherches?category=${encodeURIComponent(category)}`;

const renderGlossary = (entries: GlossaryEntry[]) => (
  <div className="condition-glossary my-10 border-y border-border/70">
    {entries.map((entry) => (
      <div key={`${entry.term}-${entry.abbreviation}`} className="py-5 border-b border-border/60 last:border-b-0">
        <div className="font-sans text-base font-semibold text-primary">
          {entry.term} <span className="text-gold">({entry.abbreviation})</span>
        </div>
        <p className="mt-2 font-sans text-base leading-relaxed text-blog-body-muted">
          {entry.description}
        </p>
      </div>
    ))}
  </div>
);

const renderBlock = (block: BlogContentBlock, index: number) => {
  if (block.type === "heading") {
    return (
      <h2 key={`${block.text}-${index}`} className="mt-12 font-display text-3xl font-semibold leading-tight text-primary md:text-4xl">
        {block.text}
      </h2>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={`${block.text}-${index}`} className="my-10 border-l-2 border-gold pl-6 font-display text-2xl italic leading-snug text-primary md:text-3xl">
        {block.text}
      </blockquote>
    );
  }

  if (block.type === "glossary") {
    return <div key={`glossary-${index}`}>{renderGlossary(block.entries)}</div>;
  }

  return (
    <p key={`${block.text.slice(0, 24)}-${index}`} className="font-sans text-lg leading-8 text-primary/85">
      {block.text}
    </p>
  );
};

const BlogArticle = ({ post }: BlogArticleProps) => {
  return (
    <main className="min-h-screen bg-background pt-16">
      <section className="container mx-auto px-4 pt-10">
        <nav className="mb-5 flex flex-wrap items-center gap-2 font-sans text-sm text-primary/55" aria-label="Fil d'Ariane">
          <Link to="/blog" className="transition-colors hover:text-primary">Blog</Link>
          <span aria-hidden="true">›</span>
          <Link to={categoryHref(post.category)} className="transition-colors hover:text-primary">{post.category}</Link>
          <span aria-hidden="true">›</span>
          <span className="max-w-full truncate text-primary/70">{post.title}</span>
        </nav>

        <div className="relative overflow-hidden rounded-md bg-primary aspect-video">
          <img
            src={post.heroImage}
            alt={post.heroAlt}
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
            <p className="mb-3 font-sans text-sm font-medium uppercase text-gold">{post.category}</p>
            <h1 className="max-w-5xl font-display text-4xl font-semibold leading-tight text-cream md:text-6xl">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-8 font-sans text-sm text-primary/60">
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden="true">—</span>
          <span>{post.readingTime}</span>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:gap-16">
        <article className="blog-prose space-y-7">
          {post.content.map(renderBlock)}

          <div className="mt-14 border-t border-border pt-8">
            <p className="mb-5 font-display text-2xl font-semibold text-primary">Tu veux lancer ta recherche ?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-gold px-7 text-primary hover:bg-gold/90">
                <Link to="/poster">Poster une recherche</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-primary bg-transparent px-7 text-primary hover:bg-primary hover:text-cream">
                <Link to="/recherches">Devenir findr</Link>
              </Button>
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24">
          <div className="border-l-2 border-gold bg-cream/70 p-6">
            <p className="font-display text-2xl font-semibold leading-tight text-primary">Tu cherches ce genre d'objet ?</p>
            <p className="mt-3 font-sans text-sm leading-6 text-primary/70">
              Découvre les recherches actives dans cette catégorie et laisse un findr t'aider à trouver la bonne pièce.
            </p>
            <Button asChild className="mt-5 rounded-full bg-gold text-primary hover:bg-gold/90">
              <Link to={categoryHref(post.category)}>Voir les recherches</Link>
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default BlogArticle;
