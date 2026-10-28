import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { hasShipFrom, validateShipFrom, type ShipFromFields } from "@/lib/shipFrom";

type Profile = {
  full_name?: string | null;
  ship_from_first_name?: string | null;
  ship_from_last_name?: string | null;
  ship_from_street?: string | null;
  ship_from_postal_code?: string | null;
  ship_from_city?: string | null;
};

export const SHIP_FROM_ANCHOR = "adresse-expedition";

const fromProfile = (p: Profile): ShipFromFields => {
  const [first = "", ...rest] = (p.full_name ?? "").trim().split(/\s+/);
  return {
    first_name: p.ship_from_first_name ?? first,
    last_name: p.ship_from_last_name ?? rest.join(" "),
    street: p.ship_from_street ?? "",
    postal_code: p.ship_from_postal_code ?? "",
    city: p.ship_from_city ?? "",
  };
};

const ShipFromCard = ({ profile, onSaved }: { profile: Profile; onSaved: () => void }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const saved = hasShipFrom(profile);
  const [editing, setEditing] = useState(!saved);
  const [fields, setFields] = useState<ShipFromFields>(() => fromProfile(profile));
  const [touched, setTouched] = useState<Partial<Record<keyof ShipFromFields, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === `#${SHIP_FROM_ANCHOR}`) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setEditing(true);
    }
  }, []);

  const errors = validateShipFrom(fields);
  const valid = Object.keys(errors).length === 0;

  const save = async () => {
    setTouched({ first_name: true, last_name: true, street: true, postal_code: true, city: true });
    if (!valid) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_ship_from", {
      _first_name: fields.first_name,
      _last_name: fields.last_name,
      _street: fields.street,
      _postal_code: fields.postal_code,
      _city: fields.city,
      _country: "FR",
    });
    setSaving(false);
    if (error) {
      toast({ title: t("shipFrom.saveError"), variant: "destructive" });
      return;
    }
    toast({ title: t("shipFrom.saved") });
    setEditing(false);
    onSaved();
  };

  const field = (key: keyof ShipFromFields, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <div className="space-y-1">
      <Label htmlFor={`ship-from-${key}`}>{t(`shipFrom.fields.${key}`)}</Label>
      <Input
        id={`ship-from-${key}`}
        value={fields[key]}
        onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
        onBlur={() => setTouched((s) => ({ ...s, [key]: true }))}
        aria-invalid={touched[key] && errors[key] ? true : undefined}
        aria-describedby={touched[key] && errors[key] ? `ship-from-${key}-error` : undefined}
        {...extra}
      />
      {touched[key] && errors[key] && (
        <p id={`ship-from-${key}-error`} className="text-xs text-destructive">{t(`shipFrom.errors.${key}`)}</p>
      )}
    </div>
  );

  return (
    <div id={SHIP_FROM_ANCHOR} ref={ref} className="mb-6 rounded-xl p-5 bg-white scroll-mt-24" style={{ border: "1px solid #E5E1D8" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FBF3E2" }}>
            <Package className="w-5 h-5" style={{ color: "#8B6B1F" }} />
          </div>
          <div>
            <h3 className="font-semibold inline-flex items-center gap-1.5" style={{ color: "#070E42" }}>
              {t("shipFrom.title")}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("shipFrom.info")}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/50 text-[10px] font-semibold leading-none text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    ?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed">{t("shipFrom.info")}</TooltipContent>
              </Tooltip>
            </h3>
            {saved && !editing ? (
              <p className="text-sm" style={{ color: "#4B5563" }}>
                {profile.ship_from_first_name} {profile.ship_from_last_name?.toUpperCase()} — {profile.ship_from_street}, {profile.ship_from_postal_code} {profile.ship_from_city}
              </p>
            ) : (
              <p className="text-sm" style={{ color: "#4B5563" }}>{t("shipFrom.description")}</p>
            )}
          </div>
        </div>
        {saved && !editing && (
          <Button variant="outline" onClick={() => { setFields(fromProfile(profile)); setEditing(true); }}>
            {t("shipFrom.edit")}
          </Button>
        )}
      </div>

      {editing && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => { e.preventDefault(); save(); }}
          noValidate
        >
          {field("first_name", { autoComplete: "given-name", maxLength: 60 })}
          {field("last_name", { autoComplete: "family-name", maxLength: 60 })}
          <div className="sm:col-span-2">{field("street", { autoComplete: "street-address", maxLength: 120 })}</div>
          {field("postal_code", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 5 })}
          {field("city", { autoComplete: "address-level2", maxLength: 80 })}
          <p className="text-xs sm:col-span-2" style={{ color: "#6B7280" }}>{t("shipFrom.countryFr")}</p>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            {saved && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>{t("shipFrom.cancel")}</Button>
            )}
            <Button type="submit" disabled={saving || !valid} style={{ backgroundColor: "#070E42", color: "#F5F0EA" }}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("shipFrom.save")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShipFromCard;
