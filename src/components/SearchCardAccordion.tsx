import { Link } from "react-router-dom";
import { Lock, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  image_url: string | null;
  urgency: string | null;
  proposal_count?: number;
  reservation_count?: number;
}

interface SearchCardAccordionProps {
  search: SearchItem;
  onDataChange: () => void;
}

const SearchCardAccordion = ({ search }: SearchCardAccordionProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="py-4">
        <div className="flex gap-4">
          <Link to={`/recherche/${search.id}`} className="flex-shrink-0">
            {search.image_url ? (
              <img
                src={search.image_url}
                alt={search.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <Link to={`/recherche/${search.id}`}>
                  <h3 className="font-semibold text-primary truncate hover:text-accent transition-colors">{search.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">{search.category}</p>
                {(search.budget_min || search.budget_max) && (
                  <p className="text-sm mt-1">
                    Budget: {search.budget_min || 0}€ - {search.budget_max || "∞"}€
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {search.status === "reserved" ? (
                  <Badge className="bg-accent/20 text-accent border border-accent/50 gap-1 flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    Réservée
                  </Badge>
                ) : (
                  <Badge variant={search.status === "active" ? "default" : "secondary"} className="flex-shrink-0">
                    {search.status === "active" ? "Active" : search.status === "paused" ? "En pause" : search.status}
                  </Badge>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/modifier-recherche/${search.id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchCardAccordion;
