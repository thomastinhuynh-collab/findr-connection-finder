import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useKeywordAlerts } from "@/hooks/useKeywordAlerts";

const NAVY = "#070E42";
const GOLD = "#D9BB87";

const KeywordAlertsPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { alerts, loading, saving, limit, limitReached, addAlert, removeAlert } = useKeywordAlerts();
  const [value, setValue] = useState("");

  const handleAdd = async () => {
    const result = await addAlert(value);
    if (result === null) {
      setValue("");
      toast({ title: t("keywordAlerts.added") });
      return;
    }
    toast({
      title: t("common.error"),
      description: t(`keywordAlerts.errors.${result}`),
      variant: "destructive",
    });
  };

  const handleRemove = async (id: string) => {
    const ok = await removeAlert(id);
    toast(
      ok
        ? { title: t("keywordAlerts.removed") }
        : { title: t("common.error"), description: t("keywordAlerts.errors.error"), variant: "destructive" }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          {t("keywordAlerts.intro")}
        </p>
        <p className="text-xs mt-1" style={{ color: NAVY, fontWeight: 600 }}>
          {t("keywordAlerts.counter", { count: alerts.length, limit })}
        </p>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!limitReached && !saving) handleAdd();
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("keywordAlerts.placeholder")}
          maxLength={60}
          disabled={limitReached}
          style={{ borderColor: "#E5E1D8" }}
        />
        <Button
          type="submit"
          size="sm"
          disabled={limitReached || saving || value.trim().length < 2}
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          <span style={{ fontSize: 15, marginRight: 6, lineHeight: 1 }}>+</span>
          {saving ? t("common.saving") : t("keywordAlerts.add")}
        </Button>
      </form>

      {limitReached && (
        <p className="text-xs" style={{ color: "#B45309" }}>
          {t("keywordAlerts.limitReached", { limit })}
        </p>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>
          {t("common.loading")}
        </p>
      ) : alerts.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "#6B7280" }}>
          {t("keywordAlerts.empty")}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{ backgroundColor: "#F5F0EA", border: "1px solid #E5E1D8", color: NAVY }}
            >
              <span>{a.keyword}</span>
              <button
                type="button"
                onClick={() => handleRemove(a.id)}
                aria-label={t("keywordAlerts.remove", { keyword: a.keyword })}
                className="leading-none hover:opacity-70"
                style={{ color: "#6B7280", fontSize: 16 }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KeywordAlertsPanel;
