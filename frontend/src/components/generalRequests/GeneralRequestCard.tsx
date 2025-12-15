import { GeneralRequest, GeneralRequestStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MessageSquare, X, CheckCircle, Link as LinkIcon } from "lucide-react";
import { ResponseCard } from "./ResponseCard";
import { LinkItemDialog } from "./LinkItemDialog";
import { useState } from "react";

interface GeneralRequestCardProps {
  request: GeneralRequest;
  currentUserId?: string;
  onCancel?: (id: string) => void;
  onFulfill?: (id: string) => void;
  isLoading?: boolean;
}

export function GeneralRequestCard({
  request,
  currentUserId,
  onCancel,
  onFulfill,
  isLoading = false,
}: GeneralRequestCardProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const isOwner = currentUserId === request.requesterId;

  const getStatusColor = (status: GeneralRequestStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "FULFILLED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: GeneralRequestStatus) => {
    switch (status) {
      case "OPEN":
        return "Ouverte";
      case "FULFILLED":
        return "Satisfaite";
      case "CANCELLED":
        return "Annulée";
    }
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">{request.title}</h3>
          {request.description && (
            <p className="text-muted-foreground">{request.description}</p>
          )}
        </div>
        <Badge className={getStatusColor(request.status)}>
          {getStatusLabel(request.status)}
        </Badge>
      </div>

      {/* Requester info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Demandeur: {request.requester.name}</span>
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

      {/* Responses */}
      {request.responses && request.responses.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Propositions ({request.responses.length})
          </h4>
          <div className="space-y-2">
            {request.responses.map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t pt-4">
        {!isOwner && request.status === "OPEN" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
            className="gap-1"
          >
            <LinkIcon className="h-4 w-4" />
            Proposer un objet
          </Button>
        )}

        {isOwner && request.status === "OPEN" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFulfill?.(request.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Marquer comme satisfaite
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(request.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Annuler
            </Button>
          </>
        )}
      </div>

      {/* Link Item Dialog */}
      <LinkItemDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        requestId={request.id}
      />
    </Card>
  );
}
