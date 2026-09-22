import { Label } from "@/components/ui/label";

export const OBJECT_SIZES = [
  { value: "S", label: "S — petit objet (carte, bijou)" },
  { value: "M", label: "M — vêtement, boîte moyenne" },
  { value: "L", label: "L — objet volumineux (petit meuble)" },
  { value: "XL", label: "XL — meuble imposant (transporteur spécifique)" },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const ObjectSizeField = ({ value, onChange }: Props) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <Label className="text-lg font-semibold text-primary mb-4 block">Taille de l'objet *</Label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {OBJECT_SIZES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className="rounded-lg px-3 py-2 text-left text-sm transition-colors"
          style={{
            backgroundColor: value === s.value ? "#070E42" : "transparent",
            color: value === s.value ? "#F5F0EA" : "#070E42",
            border: `1px solid ${value === s.value ? "#070E42" : "#E5DED4"}`,
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  </div>
);

export default ObjectSizeField;
