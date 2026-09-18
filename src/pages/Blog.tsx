import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/content/blog/posts";
import { usePageMeta } from "@/hooks/usePageMeta";

const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const Blog = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en-GB" : "fr-FR";

  usePageMeta({
    title: t("blog.metaTitle"),
    description: t("blog.metaDescription"),
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24">
        <section className="container mx-auto px-4 pb-10 pt-8 md:pb-14 md:pt-14">
          <p className="font-sans text-sm font-medium uppercase text-gold">{t("blog.label")}</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-tight text-primary md:text-7xl">
            {t("blog.title")}
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-primary/70">
            {t("blog.subtitle")}
          </p>
        </section>

        <section className="container mx-auto grid gap-7 px-4 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group flex h-full flex-col overflow-hidden border border-border bg-card">
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden bg-primary aspect-video">
                <img
                  src={post.heroImage}
                    alt={t(`${post.i18nKey}.heroAlt`)}
                  width={1600}
                  height={900}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 font-sans text-xs text-primary/55">
                  <span>{t(`blog.categories.${post.categoryKey}`)}</span>
                  <span aria-hidden="true">—</span>
                  <span>{formatDate(post.publishedAt, locale)}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-primary">
                  <Link to={`/blog/${post.slug}`} className="transition-colors hover:text-secondary">
                    {t(`${post.i18nKey}.title`)}
                  </Link>
                </h2>
                <p className="mt-4 flex-1 font-sans text-sm leading-6 text-primary/70">{t(`${post.i18nKey}.excerpt`)}</p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="font-sans text-xs text-primary/55">{t(`${post.i18nKey}.readingTime`)}</span>
                  <Button asChild variant="link" className="h-auto p-0 text-primary">
                    <Link to={`/blog/${post.slug}`}>{t("blog.readArticle")}</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
