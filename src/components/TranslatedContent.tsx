import { ReactNode } from "react";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";
import TranslationNotice from "@/components/TranslationNotice";

const TranslatedContent = ({
  type,
  id,
  title,
  description,
  sourceLang,
  children,
  showNotice = false,
}: {
  type: "search" | "proposal";
  id: string;
  title: string;
  description?: string | null;
  sourceLang?: string | null;
  children: (content: { title: string; description: string | null }) => ReactNode;
  showNotice?: boolean;
}) => {
  const content = useTranslatedContent({ type, id, title, description, sourceLang });
  return (
    <>
      {children({ title: content.title, description: content.description })}
      {showNotice && (
        <TranslationNotice
          translated={content.isTranslated}
          showingOriginal={content.showOriginal}
          loading={content.loading}
          error={content.error}
          onToggle={content.canToggle ? content.toggle : undefined}
        />
      )}
    </>
  );
};

export default TranslatedContent;