import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, Pencil, Trash2, Image } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "tools", emoji: "🔧", name: "Tools" },
  { id: "kitchen", emoji: "🍳", name: "Kitchen" },
  { id: "sports", emoji: "⚽", name: "Sports" },
  { id: "electronics", emoji: "💻", name: "Electronics" },
  { id: "books", emoji: "📚", name: "Books" },
  { id: "games", emoji: "🎮", name: "Games" },
  { id: "camping", emoji: "🏕️", name: "Camping" },
  { id: "other", emoji: "📦", name: "Other" },
];

// Mock data
const initialItems = [
  { id: 1, title: "Cordless Drill", description: "Makita 18V, great for home projects", category: "tools", available: true },
  { id: 2, title: "Camping Tent", description: "4-person, waterproof", category: "camping", available: true },
  { id: 3, title: "Pressure Washer", description: "Electric, 2000 PSI", category: "tools", available: false },
];

export default function MyItems() {
  const [items, setItems] = useState(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", category: "" });

  const getCategoryEmoji = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.emoji || "📦";
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.category) {
      toast.error("Please fill in required fields");
      return;
    }
    
    setItems([...items, { 
      id: Date.now(), 
      ...newItem, 
      available: true 
    }]);
    setNewItem({ title: "", description: "", category: "" });
    setDialogOpen(false);
    toast.success("Item added successfully!");
  };

  const toggleAvailability = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    toast.success("Availability updated");
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Item deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Items</h1>
            <p className="text-muted-foreground">Manage items you're willing to lend</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add something you're willing to lend to your friends
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What is it?"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any details that might help..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground mt-1">Up to 10 images</p>
                  </div>
                </div>
                
                <Button onClick={handleAddItem} className="w-full" variant="hero">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Items List */}
        {items.length > 0 ? (
          <div className="grid gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-soft animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Emoji thumbnail */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-2xl shrink-0">
                  {getCategoryEmoji(item.category)}
                </div>
                
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    <Badge variant={item.available ? "default" : "secondary"} className={item.available ? "bg-success text-success-foreground" : ""}>
                      {item.available ? "Available" : "Borrowed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.description || "No description"}</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`available-${item.id}`} className="text-sm text-muted-foreground">
                      Available
                    </Label>
                    <Switch
                      id={`available-${item.id}`}
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id)}
                    />
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
            <h3 className="text-lg font-semibold text-foreground mb-2">No items yet</h3>
            <p className="text-muted-foreground mb-6">Start adding things you're willing to lend</p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Item
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
