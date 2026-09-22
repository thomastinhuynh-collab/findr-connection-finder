// Étape buyr : comment veut-il recevoir son colis ?
// Composant autonome (domicile ou point relais), sauvegarde directe sur la réservation.
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export type DeliveryAddress = {
  street: string;
  postal_code: string;
  city: string;
};

export type DeliveryRelayPoint = {
  carrier: "mondial_relay" | "chronopost";
  id: string;
  name: string;
  address: string;
  postal_code?: string | null;
};

export type DeliveryChoice = {
  delivery_type: "domicile" | "point_relais" | null;
  delivery_address: DeliveryAddress | null;
  delivery_relay_point: DeliveryRelayPoint | null;
};

const CARRIERS: Record<DeliveryRelayPoint["carrier"], { label: string; url: string }> = {
  mondial_relay: {
    label: "Mondial Relay",
    url: "https://www.mondialrelay.fr/trouver-le-point-relais-le-plus-proche-de-chez-moi/",
  },
  chronopost: {
    label: "Chronopost Point Retrait",
    url: "https://www.chronopost.fr/fr/relais-pickup",
  },
};

interface Props {
  reservationId: string;
  value: DeliveryChoice;
  onSaved: () => void;
}

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const CREAM = "#F5F0EA";

const DeliveryChoicePicker = ({ reservationId, value, onSaved }: Props) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"domicile" | "point_relais">(
    value.delivery_type ?? "domicile",
  );
  const [street, setStreet] = useState(value.delivery_address?.street ?? "");
  const [addrPostal, setAddrPostal] = useState(value.delivery_address?.postal_code ?? "");
  const [city, setCity] = useState(value.delivery_address?.city ?? "");

  const [carrier, setCarrier] = useState<DeliveryRelayPoint["carrier"]>(
    value.delivery_relay_point?.carrier ?? "mondial_relay",
  );
  const [relayPostal, setRelayPostal] = useState(value.delivery_relay_point?.postal_code ?? "");
  const [relayName, setRelayName] = useState(value.delivery_relay_point?.name ?? "");
  const [relayAddress, setRelayAddress] = useState(value.delivery_relay_point?.address ?? "");
  const [relayId, setRelayId] = useState(value.delivery_relay_point?.id ?? "");

  const [saving, setSaving] = useState(false);

  const canSave =
    mode === "domicile"
      ? street.trim().length > 3 && addrPostal.trim().length >= 4 && city.trim().length > 1
      : relayName.trim().length > 1 && relayAddress.trim().length > 3 && relayId.trim().length > 1;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload =
        mode === "domicile"
          ? {
              delivery_type: "domicile",
              delivery_address: {
                street: street.trim(),
                postal_code: addrPostal.trim(),
                city: city.trim(),
              },
              delivery_relay_point: null,
            }
          : {
              delivery_type: "point_relais",
              delivery_address: null,
              delivery_relay_point: {
                carrier,
                id: relayId.trim(),
                name: relayName.trim(),
                address: relayAddress.trim(),
                postal_code: relayPostal.trim() || null,
              },
            };

      const { error } = await supabase
        .from("reservations")
        .update(payload as never)
        .eq("id", reservationId);
      if (error) throw error;

      toast({ title: t("delivery.saved") });
      onSaved();
    } catch (e: unknown) {
      toast({
        title: t("common.error"),
        description: (e as Error)?.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="w-full rounded-lg p-3 space-y-3"
      style={{ backgroundColor: CREAM, border: `1px solid ${GOLD}` }}
    >
      <div>
        <p style={{ color: NAVY, fontWeight: 600, fontSize: 14 }}>{t("delivery.question")}</p>
        <p style={{ color: "#777777", fontSize: 12 }}>{t("delivery.hint")}</p>
      </div>

      <div className="flex gap-2">
        {(["domicile", "point_relais"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="flex-1 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{
              backgroundColor: mode === m ? NAVY : "transparent",
              color: mode === m ? CREAM : NAVY,
              border: `1px solid ${NAVY}`,
            }}
          >
            {m === "domicile" ? t("delivery.home") : t("delivery.relay")}
          </button>
        ))}
      </div>

      {mode === "domicile" ? (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="del-street">{t("delivery.street")}</Label>
            <Input
              id="del-street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="12 rue de Bretagne"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="del-cp">{t("delivery.postalCode")}</Label>
              <Input
                id="del-cp"
                value={addrPostal}
                onChange={(e) => setAddrPostal(e.target.value)}
                placeholder="75003"
                inputMode="numeric"
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="del-city">{t("delivery.city")}</Label>
              <Input
                id="del-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            {(Object.keys(CARRIERS) as DeliveryRelayPoint["carrier"][]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCarrier(c)}
                className="flex-1 rounded-lg px-3 py-2 text-xs transition-colors"
                style={{
                  backgroundColor: carrier === c ? GOLD : "transparent",
                  color: NAVY,
                  border: `1px solid ${GOLD}`,
                }}
              >
                {CARRIERS[c].label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="del-relay-cp">{t("delivery.postalCode")}</Label>
            <Input
              id="del-relay-cp"
              value={relayPostal}
              onChange={(e) => setRelayPostal(e.target.value)}
              placeholder="75003"
              inputMode="numeric"
              maxLength={10}
            />
            <p style={{ color: "#777777", fontSize: 12 }}>{t("delivery.relayHint")}</p>
            <a
              href={CARRIERS[carrier].url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: NAVY, fontSize: 13, textDecoration: "underline" }}
            >
              {t("delivery.relaySearch", { carrier: CARRIERS[carrier].label })} →
            </a>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="del-relay-name">{t("delivery.relayName")}</Label>
            <Input
              id="del-relay-name"
              value={relayName}
              onChange={(e) => setRelayName(e.target.value)}
              placeholder="Tabac du Marché"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-relay-address">{t("delivery.relayAddress")}</Label>
            <Input
              id="del-relay-address"
              value={relayAddress}
              onChange={(e) => setRelayAddress(e.target.value)}
              placeholder="12 rue de Bretagne, Paris"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-relay-id">{t("delivery.relayId")}</Label>
            <Input
              id="del-relay-id"
              value={relayId}
              onChange={(e) => setRelayId(e.target.value)}
              placeholder="FR-123456"
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={save}
        disabled={!canSave || saving}
        style={{ backgroundColor: GOLD, color: NAVY }}
      >
        {saving ? t("delivery.saving") : t("delivery.confirm")}
      </Button>
    </div>
  );
};

export default DeliveryChoicePicker;
