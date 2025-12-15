import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
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
import { Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCategoryEmoji } from "@/lib/categories";

interface LinkItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

interface ItemData {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  category: string;
}

export function LinkItemDialog({ open, onOpenChange, requestId }: LinkItemDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState("");
  const [message, setMessage] = useState("");

  // Fetch user's items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: async () => {
      const response = await api.getItems();
      return (response.items || []).filter((item: ItemData) => item.ownerId === user?.id);
    },
    enabled: open && !!user?.id,
  });

  // Link item mutation
  const linkMutation = useMutation({
    mutationFn: () => api.respondToGeneralRequest(requestId, selectedItemId, message),
    onSuccess: () => {
      toast.success("Objet proposé avec succès!");
      onOpenChange(false);
      setSelectedItemId("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["general-requests"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      toast.error("Sélectionne un objet");
      return;
    }
    linkMutation.mutate();
  };

  const items = itemsData || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposer un objet</DialogTitle>
          <DialogDescription>
            Sélectionne un de tes objets à proposer pour cette demande
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {itemsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-2">
              <Label>Choisis un objet</Label>
              <RadioGroup value={selectedItemId} onValueChange={setSelectedItemId}>
                {items.map((item: ItemData) => (
                  <div key={item.id} className="flex items-center space-x-3 border rounded-lg p-3">
                    <RadioGroupItem value={item.id} id={item.id} />
                    <label
                      htmlFor={item.id}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Tu n'as pas d'objets. Ajoute-en dans "Mes objets" d'abord.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Ex: Je peux te prêter ça pour le weekend..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={linkMutation.isPending}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={linkMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={linkMutation.isPending || items.length === 0}>
              {linkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <LinkIcon className="h-4 w-4" />
              Proposer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
