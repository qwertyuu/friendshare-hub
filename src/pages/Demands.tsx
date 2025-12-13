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
import { Plus, Search, User, MessageSquare, HandHeart } from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockDemands = [
  { id: 1, title: "Looking for a bicycle", description: "Need one for weekend rides, any type works!", user: "Sarah", timeAgo: "2 hours ago" },
  { id: 2, title: "Anyone have a projector?", description: "For a movie night this Saturday", user: "Mike", timeAgo: "5 hours ago" },
  { id: 3, title: "Need a sewing machine", description: "Just for a quick hem, will return same day", user: "Emma", timeAgo: "1 day ago" },
  { id: 4, title: "Looking for board games", description: "Hosting game night, need 4+ player games", user: "Alex", timeAgo: "2 days ago" },
];

export default function Demands() {
  const [demands, setDemands] = useState(mockDemands);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDemand, setNewDemand] = useState({ title: "", description: "" });

  const handleAddDemand = () => {
    if (!newDemand.title) {
      toast.error("Please add a title for your request");
      return;
    }
    
    setDemands([
      { 
        id: Date.now(), 
        ...newDemand, 
        user: "You", 
        timeAgo: "Just now" 
      },
      ...demands
    ]);
    setNewDemand({ title: "", description: "" });
    setDialogOpen(false);
    toast.success("Request posted! Hopefully someone has what you need.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Open Demands</h1>
            <p className="text-muted-foreground">See what people are looking for & offer to help</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="warm">
                <Plus className="h-4 w-4" />
                Post a Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Looking for something?</DialogTitle>
                <DialogDescription>
                  Post a request and someone with that item might offer to lend it
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">What do you need? *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Looking for a ladder"
                    value={newDemand.title}
                    onChange={(e) => setNewDemand({ ...newDemand, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">More details</Label>
                  <Textarea
                    id="description"
                    placeholder="When do you need it? Any specific requirements?"
                    value={newDemand.description}
                    onChange={(e) => setNewDemand({ ...newDemand, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddDemand} className="w-full" variant="warm">
                  Post Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Demands List */}
        <div className="space-y-4">
          {demands.map((demand, index) => (
            <div
              key={demand.id}
              className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent shrink-0">
                <Search className="h-6 w-6" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground mb-1">{demand.title}</h3>
                {demand.description && (
                  <p className="text-muted-foreground mb-3">{demand.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {demand.user}
                  </span>
                  <span>{demand.timeAgo}</span>
                </div>
              </div>
              
              {/* Action */}
              <Button variant="success" className="shrink-0">
                <HandHeart className="h-4 w-4" />
                I Have This!
              </Button>
            </div>
          ))}
        </div>

        {demands.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No open requests</h3>
            <p className="text-muted-foreground mb-6">Be the first to post what you're looking for</p>
            <Button variant="warm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Post a Request
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
