import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";

const categories = [
  { id: "all", emoji: "✨", name: "Tout" },
  { id: "tools", emoji: "🔧", name: "Outils" },
  { id: "kitchen", emoji: "🍳", name: "Cuisine" },
  { id: "sports", emoji: "⚽", name: "Sport" },
  { id: "electronics", emoji: "💻", name: "Électronique" },
  { id: "books", emoji: "📚", name: "Livres" },
  { id: "games", emoji: "🎮", name: "Jeux" },
  { id: "camping", emoji: "🏕️", name: "Camping" },
  { id: "other", emoji: "📦", name: "Autre" },
];

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun objet pour l'instant</h3>
          <p className="text-muted-foreground">Les objets de tes amis apparaîtront ici</p>
        </div>
      </main>
    </div>
  );
}
