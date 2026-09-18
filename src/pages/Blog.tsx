import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/content/blog/posts";
import { usePageMeta } from "@/hooks/usePageMeta";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const Blog = () => {
  usePageMeta({
    title: "Blog findr — guides vintage, collector et pop culture",
    description:
      "Conseils findr pour reconnaître, authentifier, entretenir et chiner les pièces vintage, les cartes de collection et les objets pop culture.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <section className="container mx-auto px-4 pb-10 pt-8 md:pb-14 md:pt-14">
          <p className="font-sans text-sm font-medium uppercase text-gold">Blog</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-tight text-primary md:text-7xl">
            Guides pour mieux chiner, vérifier et transmettre les objets qui comptent.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-8 text-primary/70">
            Les premiers repères findr pour acheter, vendre ou chercher une pièce vintage avec un œil plus précis.
          </p>
        </section>

        <section className="container mx-auto grid gap-7 px-4 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group flex h-full flex-col overflow-hidden border border-border bg-card">
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden bg-primary aspect-video">
                <img
                  src={post.heroImage}
                  alt={post.heroAlt}
                  width={1600}
                  height={900}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 font-sans text-xs text-primary/55">
                  <span>{post.category}</span>
                  <span aria-hidden="true">—</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-primary">
                  <Link to={`/blog/${post.slug}`} className="transition-colors hover:text-secondary">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 flex-1 font-sans text-sm leading-6 text-primary/70">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="font-sans text-xs text-primary/55">{post.readingTime}</span>
                  <Button asChild variant="link" className="h-auto p-0 text-primary">
                    <Link to={`/blog/${post.slug}`}>Lire l'article →</Link>
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
