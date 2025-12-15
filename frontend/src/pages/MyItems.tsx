import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ItemCard } from "@/components/items/ItemCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ItemForm } from "@/components/items/ItemForm";
import { ImageUpload } from "@/components/items/ImageUpload";
import { ImageGallery } from "@/components/items/ImageGallery";
import { Item, ItemCategory } from "@/types";

export default function MyItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch user's items
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: async () => {
      const response = await api.getItems();
      // Filter to only user's items
      return response.items.filter((item) => item.ownerId === user?.id);
    },
    enabled: !!user?.id,
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: ItemCategory }) => {
      return api.createItem(data.title, data.description, data.category);
    },
    onSuccess: async (response) => {
      // Extract item from response (backend returns {item: {...}})
      const newItem = response.item || response;

      // Upload images if any
      if (selectedFiles.length > 0) {
        try {
          await api.uploadImages(newItem.id, selectedFiles);
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Objet créé mais erreur lors de l'upload des images");
        }
      }
      toast.success("Objet créé avec succès!");
      setDialogOpen(false);
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: ItemCategory }) => {
      if (!editingItem) throw new Error("No item selected");
      return api.updateItem(editingItem.id, data);
    },
    onSuccess: async () => {
      if (selectedFiles.length > 0 && editingItem) {
        try {
          await api.uploadImages(editingItem.id, selectedFiles);
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Objet modifié mais erreur lors de l'upload des images");
        }
      }
      toast.success("Objet modifié avec succès!");
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la modification");
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => api.deleteItem(id),
    onSuccess: () => {
      toast.success("Objet supprimé avec succès!");
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: ({ itemId, imageId }: { itemId: string; imageId: string }) =>
      api.deleteImage(itemId, imageId),
    onSuccess: () => {
      toast.success("Image supprimée!");
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    },
  });

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: ItemCategory;
  }) => {
    if (editingItem) {
      await updateItemMutation.mutateAsync(data);
    } else {
      await createItemMutation.mutateAsync(data);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const items = itemsData || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mes objets</h1>
            <p className="text-muted-foreground">Gère les objets que tu peux prêter</p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingItem(null);
                setSelectedFiles([]);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Modifier l'objet" : "Ajouter un objet"}</DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Mets à jour les informations de cet objet"
                    : "Ajoute quelque chose que tu peux prêter à tes amis"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <ItemForm
                  item={editingItem}
                  onSubmit={handleSubmit}
                  isLoading={createItemMutation.isPending || updateItemMutation.isPending}
                  buttonText={editingItem ? "Modifier l'objet" : "Créer l'objet"}
                />

                <div className="border-t pt-6">
                  <ImageUpload onFilesSelected={setSelectedFiles} />
                </div>

                {editingItem && editingItem.images.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Photos existantes</h3>
                    <ImageGallery
                      images={editingItem.images}
                      onDelete={async (imageId) => {
                        await deleteImageMutation.mutateAsync({
                          itemId: editingItem.id,
                          imageId,
                        });
                      }}
                      isLoading={deleteImageMutation.isPending}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Items Grid or Empty State */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <ItemCard item={item} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingItem(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirm(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun objet</h3>
            <p className="text-muted-foreground mb-6">Commence par ajouter des choses que tu peux prêter</p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter mon premier objet
            </Button>
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'objet</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. L'objet sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  deleteItemMutation.mutate(deleteConfirm);
                }
              }}
              disabled={deleteItemMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteItemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
