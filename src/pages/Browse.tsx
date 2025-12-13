import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, User } from "lucide-react";

const categories = [
  { id: "all", emoji: "✨", name: "All" },
  { id: "tools", emoji: "🔧", name: "Tools" },
  { id: "kitchen", emoji: "🍳", name: "Kitchen" },
  { id: "sports", emoji: "⚽", name: "Sports" },
  { id: "electronics", emoji: "💻", name: "Electronics" },
  { id: "books", emoji: "📚", name: "Books" },
  { id: "games", emoji: "🎮", name: "Games" },
  { id: "camping", emoji: "🏕️", name: "Camping" },
  { id: "other", emoji: "📦", name: "Other" },
];

// Mock data - will be replaced with real data
const mockItems = [
  { id: 1, title: "Cordless Drill", description: "Makita 18V, great for home projects", category: "tools", owner: "Alex", available: true, image: "🔧" },
  { id: 2, title: "Stand Mixer", description: "KitchenAid 5qt, perfect for baking", category: "kitchen", owner: "Sarah", available: true, image: "🍳" },
  { id: 3, title: "Mountain Bike", description: "Trek 26\", good condition", category: "sports", owner: "Mike", available: false, image: "⚽" },
  { id: 4, title: "DSLR Camera", description: "Canon EOS, with 50mm lens", category: "electronics", owner: "Emma", available: true, image: "💻" },
  { id: 5, title: "Camping Tent", description: "4-person, waterproof", category: "camping", owner: "Alex", available: true, image: "🏕️" },
  { id: 6, title: "Board Games Collection", description: "Catan, Ticket to Ride, more", category: "games", owner: "Sarah", available: true, image: "🎮" },
  { id: 7, title: "Pressure Washer", description: "Electric, 2000 PSI", category: "tools", owner: "Mike", available: true, image: "🔧" },
  { id: 8, title: "Projector", description: "1080p, with HDMI", category: "electronics", owner: "Emma", available: false, image: "💻" },
];

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = mockItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Items</h1>
          <p className="text-muted-foreground">Discover what your friends are willing to lend</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
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

        {/* Items Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image placeholder */}
              <div className="aspect-square bg-secondary/50 flex items-center justify-center text-6xl group-hover:bg-secondary/70 transition-colors">
                {item.image}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
                  <Badge variant={item.available ? "default" : "secondary"} className={item.available ? "bg-success text-success-foreground" : ""}>
                    {item.available ? "Available" : "Borrowed"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{item.owner}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant={item.available ? "default" : "secondary"}
                    disabled={!item.available}
                  >
                    {item.available ? "Request" : "Unavailable"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
