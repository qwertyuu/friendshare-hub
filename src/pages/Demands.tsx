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
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Demands() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDemand, setNewDemand] = useState({ title: "", description: "" });

  const handleAddDemand = () => {
    if (!newDemand.title) {
      toast.error("Dis-nous ce que tu cherches");
      return;
    }
    
    // TODO: Sauvegarder en base
    setNewDemand({ title: "", description: "" });
    setDialogOpen(false);
    toast.success("Demande publiée !");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Demandes</h1>
            <p className="text-muted-foreground">Ce que les autres cherchent à emprunter</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="warm">
                <Plus className="h-4 w-4" />
                Publier une demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tu cherches quelque chose ?</DialogTitle>
                <DialogDescription>
                  Publie ta demande, peut-être que quelqu'un a ce qu'il te faut
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Qu'est-ce que tu cherches ? *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Un vélo pour le week-end"
                    value={newDemand.title}
                    onChange={(e) => setNewDemand({ ...newDemand, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Plus de détails</Label>
                  <Textarea
                    id="description"
                    placeholder="Quand en as-tu besoin ? Des contraintes particulières ?"
                    value={newDemand.description}
                    onChange={(e) => setNewDemand({ ...newDemand, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddDemand} className="w-full" variant="warm">
                  Publier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune demande</h3>
          <p className="text-muted-foreground mb-6">Sois le premier à demander quelque chose</p>
          <Button variant="warm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Publier une demande
          </Button>
        </div>
      </main>
    </div>
  );
}
