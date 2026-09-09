import { useEffect } from "react";

const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

interface PageMeta {
  title?: string;
  description?: string;
}

/**
 * Met à jour dynamiquement le titre et la description de la page,
 * puis restaure les valeurs d'origine au démontage.
 */
export const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    const previousTitle = document.title;
    const descTag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const ogTitleTag = document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescTag = document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const previousDesc = descTag?.getAttribute("content") ?? "";
    const previousOgTitle = ogTitleTag?.getAttribute("content") ?? "";
    const previousOgDesc = ogDescTag?.getAttribute("content") ?? "";

    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]', "property", "og:title", title);
      setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    }
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }

    return () => {
      document.title = previousTitle;
      if (previousDesc) setMeta('meta[name="description"]', "name", "description", previousDesc);
      if (previousOgTitle) setMeta('meta[property="og:title"]', "property", "og:title", previousOgTitle);
      if (previousOgDesc) setMeta('meta[property="og:description"]', "property", "og:description", previousOgDesc);
    };
  }, [title, description]);
};

export default usePageMeta;
