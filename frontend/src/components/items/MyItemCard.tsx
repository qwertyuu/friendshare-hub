import { Item } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCategoryEmoji, getCategoryLabel } from "@/lib/categories";
import { User, HelpCircle } from "lucide-react";
import { getAPIUrl } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const API_URL = getAPIUrl();

interface MyItemCardProps {
  item: Item;
  onStatusChange?: (item: Item) => void;
}

export function MyItemCard({ item, onStatusChange }: MyItemCardProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "BORROWED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "UNAVAILABLE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Disponible";
      case "BORROWED":
        return "Emprunté";
      case "UNAVAILABLE":
        return "Indisponible";
      default:
        return status;
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    const newStatus = checked ? "AVAILABLE" : "UNAVAILABLE";

    try {
      setIsUpdating(true);
      const response = await api.updateItemStatus(item.id, newStatus);
      const updatedItem = response.item || response;

      toast.success(`Objet marqué comme ${newStatus === 'AVAILABLE' ? 'disponible' : 'indisponible'}`);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      onStatusChange?.(updatedItem);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const canToggleStatus = item.status !== "BORROWED";
  const activeBorrow = item.requests && item.requests.length > 0 ? item.requests[0] : null;

  return (
    <Card className="overflow-hidden">
      {/* Image Container */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={`${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}/uploads/${item.images[0].filePath}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-4xl">{getCategoryEmoji(item.category)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(item.status)}>
            {getStatusLabel(item.status)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
            <span className="text-xl flex-shrink-0">{getCategoryEmoji(item.category)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {getCategoryLabel(item.category)}
          </p>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        {/* Status Toggle */}
        <div className="pt-3 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Disponibilité</span>
              {!canToggleStatus && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Impossible de modifier: l'objet est actuellement emprunté
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Switch
              checked={item.status === "AVAILABLE"}
              onCheckedChange={handleStatusToggle}
              disabled={!canToggleStatus || isUpdating}
            />
          </div>

          {/* Borrower Info */}
          {item.status === "BORROWED" && activeBorrow && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md space-y-1">
              <p className="text-xs text-muted-foreground">Actuellement emprunté par</p>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                {activeBorrow.requester.name}
              </p>
              {activeBorrow.endDate && (
                <p className="text-xs text-muted-foreground">
                  Jusqu'au {new Date(activeBorrow.endDate).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Owner Info */}
        <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{item.owner.name}</span>
        </div>
      </div>
    </Card>
  );
}
