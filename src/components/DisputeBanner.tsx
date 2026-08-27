import { AlertTriangle } from "lucide-react";
import { DISPUTE_REASONS } from "@/components/DisputeDialog";

interface DisputeBannerProps {
  reason?: string | null;
  description?: string | null;
  /** Affiche la catégorie et la description (findr et admin) */
  showDetails?: boolean;
}

const DisputeBanner = ({ reason, description, showDetails }: DisputeBannerProps) => (
  <div className="w-full rounded-lg border border-destructive/40 bg-destructive/10 p-3 space-y-1.5">
    <p className="text-sm font-semibold text-destructive flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      Litige en cours — en attente de résolution par l'équipe findr
    </p>
    {showDetails && (
      <div className="text-xs text-foreground space-y-1 min-w-0">
        {reason && (
          <p>
            <span className="font-medium">Motif :</span> {DISPUTE_REASONS[reason] ?? reason}
          </p>
        )}
        {description && (
          <p className="break-words">
            <span className="font-medium">Description :</span> {description}
          </p>
        )}
      </div>
    )}
  </div>
);

export default DisputeBanner;
