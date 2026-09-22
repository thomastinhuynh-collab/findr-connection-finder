import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type RelayPoint = {
  carrier: "mondial_relay" | "chronopost";
  id: string;
  name: string;
  address: string;
  postal_code?: string | null;
};

const LOCATORS: Record<RelayPoint["carrier"], { label: string; url: (cp: string) => string }> = {
  mondial_relay: {
    label: "Mondial Relay",
    url: (cp) =>
      `https://www.google.com/maps/search/${encodeURIComponent(`Point Relais Mondial Relay ${cp}`)}`,
  },
  chronopost: {
    label: "Chronopost Point Retrait",
    url: (cp) =>
      `https://www.google.com/maps/search/${encodeURIComponent(`Point Relais Chronopost ${cp}`)}`,
  },
};

interface Props {
  value: RelayPoint | null;
  onChange: (v: RelayPoint | null) => void;
}

const RelayPointPicker = ({ value, onChange }: Props) => {
  const [carrier, setCarrier] = useState<RelayPoint["carrier"]>(value?.carrier ?? "mondial_relay");
  const [postalCode, setPostalCode] = useState(value?.postal_code ?? "");
  const [pointId, setPointId] = useState(value?.id ?? "");
  const [name, setName] = useState(value?.name ?? "");
  const [address, setAddress] = useState(value?.address ?? "");

  const canSave = pointId.trim() && name.trim() && address.trim();

  const save = () => {
    if (!canSave) return;
    onChange({
      carrier,
      id: pointId.trim(),
      name: name.trim(),
      address: address.trim(),
      postal_code: postalCode.trim() || null,
    });
  };

  return (
    <div className="space-y-3">
      {value && (
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: "#F5F0EA", border: "1px solid #E5DED4" }}
        >
          <p style={{ color: "#070E42", fontSize: 13, fontWeight: 600 }}>
            {LOCATORS[value.carrier].label} — {value.name}
          </p>
          <p style={{ color: "#777777", fontSize: 12 }}>
            {value.address} {value.postal_code ? `· ${value.postal_code}` : ""}
          </p>
          <p style={{ color: "#777777", fontSize: 12 }}>Identifiant : {value.id}</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-2"
            style={{ color: "#070E42", fontSize: 12, textDecoration: "underline" }}
          >
            Retirer ce point relais
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {(Object.keys(LOCATORS) as RelayPoint["carrier"][]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCarrier(c)}
            className="flex-1 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{
              backgroundColor: carrier === c ? "#070E42" : "transparent",
              color: carrier === c ? "#F5F0EA" : "#070E42",
              border: "1px solid #070E42",
            }}
          >
            {LOCATORS[c].label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="relay-cp">Code postal</Label>
        <div className="flex gap-2">
          <Input
            id="relay-cp"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="75003"
            inputMode="numeric"
            maxLength={5}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(LOCATORS[carrier].url(postalCode), "_blank", "noopener")}
            disabled={postalCode.trim().length < 4}
          >
            Chercher →
          </Button>
        </div>
        <p style={{ color: "#777777", fontSize: 12 }}>
          La recherche s'ouvre sur le site du transporteur. Recopie ensuite le point choisi ci-dessous.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="relay-name">Nom du point relais</Label>
        <Input
          id="relay-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tabac du Marché"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="relay-address">Adresse</Label>
        <Input
          id="relay-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="12 rue de Bretagne, Paris"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="relay-id">Identifiant du point</Label>
        <Input
          id="relay-id"
          value={pointId}
          onChange={(e) => setPointId(e.target.value)}
          placeholder="FR-123456"
        />
      </div>

      <Button
        type="button"
        onClick={save}
        disabled={!canSave}
        style={{ backgroundColor: "#D9BB87", color: "#070E42" }}
      >
        Utiliser ce point relais
      </Button>
    </div>
  );
};

export default RelayPointPicker;
