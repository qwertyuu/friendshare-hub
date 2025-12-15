import { BorrowRequest, RequestStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MessageCircle, X, CheckCircle } from "lucide-react";
import { getCategoryEmoji } from "@/lib/categories";

interface OutgoingRequestCardProps {
  request: BorrowRequest;
  onCancel?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function OutgoingRequestCard({
  request,
  onCancel,
  onComplete,
  isLoading = false,
}: OutgoingRequestCardProps) {
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      case "COMPLETED":
        return "Complété";
      default:
        return status;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header with status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryEmoji(request.item.category)}</span>
            <div>
              <h3 className="font-semibold text-foreground">{request.item.title}</h3>
              <p className="text-sm text-muted-foreground">{request.item.description}</p>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(request.status)}>
          {getStatusLabel(request.status)}
        </Badge>
      </div>

      {/* Owner info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
        <User className="h-4 w-4" />
        <span>Propriétaire: {request.item.owner.name}</span>
      </div>

      {/* Dates */}
      {(request.startDate || request.endDate) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {request.startDate && new Date(request.startDate).toLocaleDateString("fr-FR")}
            {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString("fr-FR")}`}
          </span>
        </div>
      )}

      {/* Message */}
      {request.message && (
        <div className="bg-muted/50 rounded p-2 text-sm">
          <div className="flex gap-2 items-start">
            <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{request.message}</p>
          </div>
        </div>
      )}

      {/* Response message */}
      {request.responseMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded p-2 text-sm border border-blue-200 dark:border-blue-900/30">
          <p className="font-semibold text-blue-900 dark:text-blue-400 text-xs mb-1">Réponse</p>
          <p className="text-blue-800 dark:text-blue-300">{request.responseMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t pt-4">
        {request.status === "PENDING" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel?.(request.id)}
            disabled={isLoading}
            className="flex-1 gap-1"
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>
        )}

        {request.status === "APPROVED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete?.(request.id)}
            disabled={isLoading}
            className="flex-1 gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Marquer comme complété
          </Button>
        )}
      </div>
    </Card>
  );
}
