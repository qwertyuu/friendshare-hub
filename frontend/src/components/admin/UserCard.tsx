import { User } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Check, X, Loader2, Crown, Shield } from "lucide-react";

interface UserCardProps {
  user: User;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onPromote?: (id: string) => Promise<void>;
  onDemote?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserCard({ user, onApprove, onReject, onPromote, onDemote, isLoading = false }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      default:
        return status;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{user.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
        </div>
        <Badge className={getStatusColor(user.status)}>
          {getStatusLabel(user.status)}
        </Badge>
      </div>

      {/* User Info */}
      <div className="text-sm text-muted-foreground border-t pt-2 space-y-1">
        <p>Rôle: <span className="font-medium text-foreground">{user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}</span></p>
        <p>ID: <span className="font-mono text-xs">{user.id}</span></p>
        {user.status === "REJECTED" && user.rejectionReason && (
          <p className="text-red-600 dark:text-red-400">Raison: <span className="font-medium">{user.rejectionReason}</span></p>
        )}
      </div>

      {/* Actions */}
      {user.status === "PENDING" && (
        <div className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject?.(user.id)}
            disabled={isLoading}
            className="flex-1 gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Refuser
          </Button>
          <Button
            size="sm"
            onClick={() => onApprove?.(user.id)}
            disabled={isLoading}
            className="flex-1 gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Approuver
          </Button>
        </div>
      )}

      {/* Role Management Actions */}
      {user.status === "APPROVED" && (
        <div className="flex gap-2 border-t pt-4">
          {user.role === "USER" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPromote?.(user.id)}
              disabled={isLoading}
              className="flex-1 gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Promouvoir
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDemote?.(user.id)}
              disabled={isLoading}
              className="flex-1 gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              Rétrograder
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
