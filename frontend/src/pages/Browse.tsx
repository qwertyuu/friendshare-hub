import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ItemCard } from "@/components/items/ItemCard";
import { categories } from "@/lib/categories";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["items", selectedCategory, page],
    queryFn: async () => {
      const category = selectedCategory === "all" ? undefined : selectedCategory;
      return api.getItems(category, "AVAILABLE", page, 20);
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
                onClick={() => {
                  // TODO: Open item details dialog
                }}
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
      </main>
    </div>
  );
}
