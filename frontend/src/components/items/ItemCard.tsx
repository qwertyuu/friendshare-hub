import { Item } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryEmoji, getCategoryLabel } from "@/lib/categories";
import { User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "BORROWED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "UNAVAILABLE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
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

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={`${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}/uploads/${item.images[0].filePath}`}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-4 space-y-2">
        <div>
          <div className="flex items-start justify-between gap-2">
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

        {/* Owner Info */}
        <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{item.owner.name}</span>
        </div>
      </div>
    </Card>
  );
}
