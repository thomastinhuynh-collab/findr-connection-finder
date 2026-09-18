import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { BlogContentBlock, BlogPost, GlossaryEntry } from "@/content/blog/posts";

interface BlogArticleProps {
  post: BlogPost;
}

const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const categoryHref = (category: string) => `/recherches?category=${encodeURIComponent(category)}`;

const renderGlossary = (entries: GlossaryEntry[], t: (key: string) => string) => (
  <div className="condition-glossary my-10 border-y border-border/70">
    {entries.map((entry) => (
      <div key={entry.termKey} className="py-5 border-b border-border/60 last:border-b-0">
        <div className="font-sans text-base font-semibold text-primary">
          {t(entry.termKey)} <span className="text-gold">({t(entry.abbreviationKey)})</span>
        </div>
        <p className="mt-2 font-sans text-base leading-relaxed text-blog-body-muted">
          {t(entry.descriptionKey)}
        </p>
      </div>
    ))}
  </div>
);

const renderBlock = (block: BlogContentBlock, index: number, t: (key: string) => string) => {
  if (block.type === "heading") {
    return (
      <h2 key={`${block.i18nKey}-${index}`} className="mt-12 font-display text-3xl font-semibold leading-tight text-primary md:text-4xl">
        <Trans i18nKey={block.i18nKey} />
      </h2>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={`${block.i18nKey}-${index}`} className="my-10 border-l-2 border-gold pl-6 font-display text-2xl italic leading-snug text-primary md:text-3xl">
        <Trans i18nKey={block.i18nKey} />
      </blockquote>
    );
  }

  if (block.type === "glossary") {
    return <div key={`glossary-${index}`}>{renderGlossary(block.entries, t)}</div>;
  }

  return (
    <p key={`${block.i18nKey}-${index}`} className="font-sans text-lg leading-8 text-primary/85">
      <Trans i18nKey={block.i18nKey} />
    </p>
  );
};

const BlogArticle = ({ post }: BlogArticleProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en-GB" : "fr-FR";
  const title = t(`${post.i18nKey}.title`);
  const category = t(`blog.categories.${post.categoryKey}`);

  return (
    <main className="min-h-screen bg-background pt-16">
      <section className="container mx-auto px-4 pt-10">
        <nav className="mb-5 flex flex-wrap items-center gap-2 font-sans text-sm text-primary/55" aria-label={t("blog.article.breadcrumb") }>
          <Link to="/blog" className="transition-colors hover:text-primary">Blog</Link>
          <span aria-hidden="true">›</span>
          <Link to={categoryHref(post.categoryFilter)} className="transition-colors hover:text-primary">{category}</Link>
          <span aria-hidden="true">›</span>
          <span className="max-w-full truncate text-primary/70">{title}</span>
        </nav>

        <div className="relative overflow-hidden rounded-md bg-primary aspect-video">
          <img
            src={post.heroImage}
            alt={t(`${post.i18nKey}.heroAlt`)}
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
            <p className="mb-3 font-sans text-sm font-medium uppercase text-gold">{category}</p>
            <h1 className="max-w-5xl font-display text-4xl font-semibold leading-tight text-cream md:text-6xl">
              <Trans i18nKey={`${post.i18nKey}.title`} />
            </h1>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-8 font-sans text-sm text-primary/60">
          <span>{formatDate(post.publishedAt, locale)}</span>
          <span aria-hidden="true">—</span>
          <span>{t(`${post.i18nKey}.readingTime`)}</span>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:gap-16">
        <article className="blog-prose space-y-7">
          {post.content.map((block, index) => renderBlock(block, index, t))}

          <div className="mt-14 border-t border-border pt-8">
            <p className="mb-5 font-display text-2xl font-semibold text-primary"><Trans i18nKey="blog.article.ctaTitle" /></p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-gold px-7 text-primary hover:bg-gold/90">
                <Link to="/poster">{t("blog.article.postSearch")}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-primary bg-transparent px-7 text-primary hover:bg-primary hover:text-cream">
                <Link to="/recherches">{t("blog.article.becomeFindr")}</Link>
              </Button>
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24">
          <div className="border-l-2 border-gold bg-cream/70 p-6">
            <p className="font-display text-2xl font-semibold leading-tight text-primary"><Trans i18nKey="blog.article.asideTitle" /></p>
            <p className="mt-3 font-sans text-sm leading-6 text-primary/70">
              <Trans i18nKey="blog.article.asideText" />
            </p>
            <Button asChild className="mt-5 rounded-full bg-gold text-primary hover:bg-gold/90">
              <Link to={categoryHref(post.categoryFilter)}>{t("blog.article.viewSearches")}</Link>
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default BlogArticle;
