import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OTHER_CATEGORY, getSubcategories, getSubcategoryLabelKey } from "@/lib/categories";

const NONE = "__none__";

interface Props {
  category: string;
  value: string;
  onChange: (value: string) => void;
}

/** Sélecteur facultatif de sous-catégorie ; rien n'est rendu pour « Autre » ou une catégorie sans sous-catégories. */
const SubcategorySelect = ({ category, value, onChange }: Props) => {
  const { t } = useTranslation();
  const subs = category && category !== OTHER_CATEGORY ? getSubcategories(category) : [];
  if (subs.length === 0) return null;
  const label = (name: string) => {
    const key = getSubcategoryLabelKey(category, name);
    return key ? t(key) : name;
  };
  return (
    <div className="space-y-2">
      <Label>{t("subcategories.optionalLabel")}</Label>
      <Select value={value || undefined} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder={t("subcategories.placeholder")} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value={NONE}>—</SelectItem>
          {subs.map((s) => (
            <SelectItem key={s.name} value={s.name}>
              {label(s.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubcategorySelect;
