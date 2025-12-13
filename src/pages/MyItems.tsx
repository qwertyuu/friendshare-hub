import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Package, Image } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "tools", emoji: "🔧", name: "Outils" },
  { id: "kitchen", emoji: "🍳", name: "Cuisine" },
  { id: "sports", emoji: "⚽", name: "Sport" },
  { id: "electronics", emoji: "💻", name: "Électronique" },
  { id: "books", emoji: "📚", name: "Livres" },
  { id: "games", emoji: "🎮", name: "Jeux" },
  { id: "camping", emoji: "🏕️", name: "Camping" },
  { id: "other", emoji: "📦", name: "Autre" },
];

export default function MyItems() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", category: "" });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.category) {
      toast.error("Remplis les champs obligatoires");
      return;
    }
    
    // TODO: Sauvegarder en base
    setNewItem({ title: "", description: "", category: "" });
    setDialogOpen(false);
    toast.success("Objet ajouté !");
  };

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
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un objet</DialogTitle>
                <DialogDescription>
                  Ajoute quelque chose que tu peux prêter à tes amis
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nom de l'objet *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Perceuse sans fil"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisis une catégorie" />
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
                    placeholder="Détails supplémentaires..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique pour ajouter des photos</p>
                    <p className="text-xs text-muted-foreground mt-1">Jusqu'à 10 images</p>
                  </div>
                </div>
                
                <Button onClick={handleAddItem} className="w-full" variant="hero">
                  Ajouter l'objet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
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
      </main>
    </div>
  );
}
