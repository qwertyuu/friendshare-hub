import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { GeneralRequestCard } from "@/components/generalRequests/GeneralRequestCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GeneralRequestForm } from "@/components/generalRequests/GeneralRequestForm";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeneralRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("OPEN");

  // Fetch all general requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["general-requests", statusFilter],
    queryFn: async () => {
      const response = await api.getGeneralRequests(statusFilter);
      return response.requests || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }) => api.createGeneralRequest(data.title, data.description, data.startDate, data.endDate),
    onSuccess: () => {
      toast.success("Demande créée avec succès!");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["general-requests"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelGeneralRequest(id),
    onSuccess: () => {
      toast.success("Demande annulée!");
      queryClient.invalidateQueries({ queryKey: ["general-requests"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur");
    },
  });

  // Fulfill mutation
  const fulfillMutation = useMutation({
    mutationFn: (id: string) => api.fulfillGeneralRequest(id),
    onSuccess: () => {
      toast.success("Demande marquée comme satisfaite!");
      queryClient.invalidateQueries({ queryKey: ["general-requests"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const requests = Array.isArray(requestsData) ? requestsData : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Demandes générales</h1>
            <p className="text-muted-foreground">
              Cherche ou propose des objets que tu aimerais emprunter
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer une demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une demande générale</DialogTitle>
                <DialogDescription>
                  Décris ce que tu cherches et laisse la communauté te proposer des objets
                </DialogDescription>
              </DialogHeader>
              <GeneralRequestForm
                onSubmit={(data) => createMutation.mutateAsync(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-medium">Statut:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Ouvertes</SelectItem>
              <SelectItem value="FULFILLED">Satisfaites</SelectItem>
              <SelectItem value="CANCELLED">Annulées</SelectItem>
              <SelectItem value="all">Toutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <GeneralRequestCard
                key={request.id}
                request={request}
                currentUserId={user?.id}
                onCancel={(id) => cancelMutation.mutate(id)}
                onFulfill={(id) => fulfillMutation.mutate(id)}
                isLoading={
                  cancelMutation.isPending || fulfillMutation.isPending
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune demande
            </h3>
            <p className="text-muted-foreground mb-6">
              Crée une demande pour trouver ce que tu cherches
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première demande
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
