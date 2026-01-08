import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Search, Package, Calendar, MapPin, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useOptimisticUpdate } from "@/utils/mutations";
import { ItemCard } from "@/components/items/ItemCard";
import { categories } from "@/lib/categories";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Item } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryEmoji, getCategoryLabel } from "@/lib/categories";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const categoryOptions = [
  { id: "all", emoji: "✨", name: "Tout" },
  { id: "TOOLS", emoji: "🔧", name: "Outils" },
  { id: "KITCHEN", emoji: "🍳", name: "Cuisine" },
  { id: "SPORTS", emoji: "⚽", name: "Sport" },
  { id: "ELECTRONICS", emoji: "💻", name: "Électronique" },
  { id: "BOOKS", emoji: "📚", name: "Livres" },
  { id: "GAMES", emoji: "🎮", name: "Jeux" },
  { id: "CAMPING", emoji: "🏕️", name: "Camping" },
  { id: "OTHER", emoji: "📦", name: "Autre" },
];

export default function Browse() {
  const queryClient = useQueryClient();
  const { invalidateQueries } = useOptimisticUpdate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [borrowMessage, setBorrowMessage] = useState("");
  const [borrowStartDate, setBorrowStartDate] = useState("");
  const [borrowEndDate, setBorrowEndDate] = useState("");

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["items", selectedCategory, page],
    queryFn: async () => {
      const category = selectedCategory === "all" ? undefined : selectedCategory;
      return api.getItems(category, "AVAILABLE", page, 20);
    },
  });

  // Create borrow request mutation
  const createBorrowMutation = useMutation({
    mutationFn: (data: {
      itemId: string;
      message?: string;
      startDate?: string;
      endDate?: string;
    }) =>
      api.createBorrowRequest(
        data.itemId,
        data.startDate,
        data.endDate,
        data.message
      ),
    onSuccess: () => {
      toast.success("Demande d'emprunt envoyée!");
      setSelectedItem(null);
      setBorrowMessage("");
      setBorrowStartDate("");
      setBorrowEndDate("");
      invalidateQueries([["items"]]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la demande"
      );
    },
  });

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!itemsData?.items) return [];
    return itemsData.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [itemsData?.items, searchQuery]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Parcourir</h1>
          <p className="text-muted-foreground">Découvre ce que tes amis peuvent te prêter</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && selectedCategory !== "all" && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Recherche limitée à la catégorie{" "}
                <span className="font-medium">
                  {categoryOptions.find((c) => c.id === selectedCategory)?.name}
                </span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-primary hover:text-primary/80 ml-1 flex items-center gap-1"
                >
                  (tout chercher)
                </button>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun objet pour l'instant</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aucun résultat ne correspond à ta recherche"
                : "Les objets de tes amis apparaîtront ici"}
            </p>
          </div>
        )}

        {/* Item Details Dialog */}
        <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <DialogDescription>
                Voir les détails et envoyer une demande d'emprunt
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-6">
                {/* Item Image */}
                <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                  {selectedItem.images && selectedItem.images.length > 0 ? (
                    <img
                      src={`${(window as any).ENV?.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${selectedItem.images[0].filePath}`}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                      <span className="text-6xl">{getCategoryEmoji(selectedItem.category)}</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
                      <Badge
                        className={
                          selectedItem.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : selectedItem.status === "BORROWED"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {selectedItem.status === "AVAILABLE"
                          ? "Disponible"
                          : selectedItem.status === "BORROWED"
                          ? "Emprunté"
                          : "Indisponible"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(selectedItem.category)} • Par {selectedItem.owner.name}
                    </p>
                  </div>

                  {selectedItem.description && (
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  {/* Borrow Request Form */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Demander à emprunter</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Date de début
                        </Label>
                        <input
                          id="start-date"
                          type="date"
                          value={borrowStartDate}
                          onChange={(e) => setBorrowStartDate(e.target.value)}
                          className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Date de fin
                        </Label>
                        <input
                          id="end-date"
                          type="date"
                          value={borrowEndDate}
                          onChange={(e) => setBorrowEndDate(e.target.value)}
                          className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="borrow-message" className="text-xs">
                        Message (optionnel)
                      </Label>
                      <Textarea
                        id="borrow-message"
                        placeholder="Ajoute un message à ta demande..."
                        value={borrowMessage}
                        onChange={(e) => setBorrowMessage(e.target.value)}
                        className="mt-1 text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          createBorrowMutation.mutate({
                            itemId: selectedItem.id,
                            message: borrowMessage || undefined,
                            startDate: borrowStartDate || undefined,
                            endDate: borrowEndDate || undefined,
                          })
                        }
                        disabled={createBorrowMutation.isPending || selectedItem.status !== "AVAILABLE"}
                        className="flex-1"
                      >
                        {createBorrowMutation.isPending
                          ? "Envoi en cours..."
                          : "Envoyer la demande"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedItem(null)}
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
