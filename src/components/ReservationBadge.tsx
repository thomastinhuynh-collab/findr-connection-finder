import { CalendarClock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationBadgeProps {
  expiresAt: string | null;
  className?: string;
}

const ReservationBadge = ({ expiresAt, className = "" }: ReservationBadgeProps) => {
  const formatExpiry = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", { locale: fr });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={`bg-accent/20 text-accent border border-accent/50 gap-1 cursor-help ${className}`}
        >
          <Lock className="w-3 h-3" />
          Réservée
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4" />
          <span>
            Réservée jusqu'au {expiresAt ? formatExpiry(expiresAt) : "..."}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ReservationBadge;
