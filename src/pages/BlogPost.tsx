import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import BlogArticle from "@/components/blog/BlogArticle";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/content/blog/posts";
import { usePageMeta } from "@/hooks/usePageMeta";

const BlogPost = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  usePageMeta({
    title: post ? `${t(`${post.i18nKey}.title`)} — findr` : t("blog.notFoundMetaTitle"),
    description: post ? t(`${post.i18nKey}.excerpt`) : t("blog.notFoundMetaDescription"),
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-32 text-center">
          <p className="font-sans text-sm font-medium uppercase text-gold">{t("blog.label")}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-primary">{t("blog.notFoundTitle")}</h1>
          <Button asChild className="mt-8 rounded-full bg-gold text-primary hover:bg-gold/90">
            <Link to="/blog">{t("blog.backToBlog")}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogArticle post={post} />
      <Footer />
    </div>
  );
};

export default BlogPost;
