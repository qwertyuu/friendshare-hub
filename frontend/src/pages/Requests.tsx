import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { OutgoingRequestCard } from "@/components/requests/OutgoingRequestCard";
import { IncomingRequestCard } from "@/components/requests/IncomingRequestCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Requests() {
  const queryClient = useQueryClient();
  const [approveDialogOpen, setApproveDialogOpen] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  // Fetch outgoing requests
  const { data: outgoingData, isLoading: outgoingLoading } = useQuery({
    queryKey: ["requests-outgoing"],
    queryFn: async () => {
      const response = await api.getMyRequests();
      return response.requests || response || [];
    },
  });

  // Fetch incoming requests
  const { data: incomingData, isLoading: incomingLoading } = useQuery({
    queryKey: ["requests-incoming"],
    queryFn: async () => {
      const response = await api.getMyDemands();
      return response.demands || response || [];
    },
  });

  // Cancel request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: (id: string) => api.cancelRequest(id),
    onSuccess: () => {
      toast.success("Demande annulée!");
      queryClient.invalidateQueries({ queryKey: ["requests-outgoing"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'annulation");
    },
  });

  // Complete request mutation
  const completeRequestMutation = useMutation({
    mutationFn: (id: string) => api.completeRequest(id),
    onSuccess: () => {
      toast.success("Demande marquée comme complétée!");
      queryClient.invalidateQueries({
        queryKey: ["requests-outgoing", "requests-incoming"],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    },
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: (data: { id: string; responseMessage?: string }) =>
      api.approveRequest(data.id, data.responseMessage),
    onSuccess: () => {
      toast.success("Demande approuvée!");
      setApproveDialogOpen(null);
      setResponseMessage("");
      queryClient.invalidateQueries({ queryKey: ["requests-incoming"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'approbation");
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: (data: { id: string; responseMessage?: string }) =>
      api.rejectRequest(data.id, data.responseMessage),
    onSuccess: () => {
      toast.success("Demande rejetée!");
      setRejectDialogOpen(null);
      setResponseMessage("");
      queryClient.invalidateQueries({ queryKey: ["requests-incoming"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors du rejet");
    },
  });

  if (outgoingLoading || incomingLoading) return <LoadingSpinner />;

  const outgoingRequests = Array.isArray(outgoingData) ? outgoingData : [];
  const incomingRequests = Array.isArray(incomingData) ? incomingData : [];

  const handleApprove = (id: string) => {
    setApproveDialogOpen(id);
    setResponseMessage("");
  };

  const handleReject = (id: string) => {
    setRejectDialogOpen(id);
    setResponseMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Emprunts</h1>
          <p className="text-muted-foreground">Gère les demandes d'emprunt</p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Reçues ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyées ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Incoming Requests */}
          <TabsContent value="incoming">
            {incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <IncomingRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => handleApprove(request.id)}
                    onReject={() => handleReject(request.id)}
                    onComplete={(id) => completeRequestMutation.mutate(id)}
                    isLoading={
                      approveRequestMutation.isPending ||
                      rejectRequestMutation.isPending ||
                      completeRequestMutation.isPending
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune demande reçue
                </h3>
                <p className="text-muted-foreground">
                  Quand quelqu'un voudra t'emprunter quelque chose, ça apparaîtra ici
                </p>
              </div>
            )}
          </TabsContent>

          {/* Outgoing Requests */}
          <TabsContent value="outgoing">
            {outgoingRequests.length > 0 ? (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <OutgoingRequestCard
                    key={request.id}
                    request={request}
                    onCancel={(id) => cancelRequestMutation.mutate(id)}
                    onComplete={(id) => completeRequestMutation.mutate(id)}
                    isLoading={cancelRequestMutation.isPending || completeRequestMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune demande envoyée
                </h3>
                <p className="text-muted-foreground">
                  Quand tu demanderas à emprunter quelque chose, ça apparaîtra ici
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Approve dialog */}
      <Dialog open={approveDialogOpen !== null} onOpenChange={() => setApproveDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande</DialogTitle>
            <DialogDescription>
              Ajoute un message optionnel avec les détails de l'emprunt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-message">Message (optionnel)</Label>
              <Textarea
                id="approve-message"
                placeholder="Ex: Vous pouvez passer la chercher lundi..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApproveDialogOpen(null)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (approveDialogOpen) {
                    approveRequestMutation.mutate({
                      id: approveDialogOpen,
                      responseMessage,
                    });
                  }
                }}
                disabled={approveRequestMutation.isPending}
              >
                {approveRequestMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Approuver
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen !== null} onOpenChange={() => setRejectDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Ajoute un message optionnel pour expliquer le refus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-message">Message (optionnel)</Label>
              <Textarea
                id="reject-message"
                placeholder="Ex: L'objet est actuellement en réparation..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogOpen(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (rejectDialogOpen) {
                    rejectRequestMutation.mutate({
                      id: rejectDialogOpen,
                      responseMessage,
                    });
                  }
                }}
                disabled={rejectRequestMutation.isPending}
              >
                {rejectRequestMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Refuser
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
