import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Check, X, Clock, Inbox, Send } from "lucide-react";
import { toast } from "sonner";

// Mock data
const initialIncoming = [
  { id: 1, item: "Cordless Drill", requester: "Sarah", message: "Need it for a weekend project, will return Monday!", status: "pending", timeAgo: "2 hours ago" },
  { id: 2, item: "Camping Tent", requester: "Mike", message: "Going camping next week!", status: "pending", timeAgo: "1 day ago" },
];

const initialOutgoing = [
  { id: 3, item: "Mountain Bike", owner: "Mike", message: "For the weekend trail ride", status: "pending", timeAgo: "3 hours ago" },
  { id: 4, item: "Stand Mixer", owner: "Sarah", message: "Baking for a party", status: "accepted", timeAgo: "2 days ago" },
  { id: 5, item: "Projector", owner: "Emma", message: "", status: "rejected", timeAgo: "3 days ago" },
];

export default function Requests() {
  const [incoming, setIncoming] = useState(initialIncoming);
  const [outgoing] = useState(initialOutgoing);

  const handleAccept = (id: number) => {
    setIncoming(incoming.map(req => 
      req.id === id ? { ...req, status: "accepted" } : req
    ));
    toast.success("Request accepted! The item is now marked as borrowed.");
  };

  const handleReject = (id: number) => {
    setIncoming(incoming.map(req => 
      req.id === id ? { ...req, status: "rejected" } : req
    ));
    toast.info("Request rejected");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="bg-success/20 text-success"><Check className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-destructive/20 text-destructive"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Requests</h1>
          <p className="text-muted-foreground">Manage borrowing requests</p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Incoming
              {incoming.filter(r => r.status === "pending").length > 0 && (
                <Badge variant="default" className="ml-1 bg-primary text-primary-foreground">
                  {incoming.filter(r => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>
          
          {/* Incoming Requests */}
          <TabsContent value="incoming">
            {incoming.length > 0 ? (
              <div className="space-y-4">
                {incoming.map((request, index) => (
                  <div
                    key={request.id}
                    className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{request.item}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>{request.requester} wants to borrow this</span>
                          <span>•</span>
                          <span>{request.timeAgo}</span>
                        </div>
                        
                        {request.message && (
                          <p className="text-muted-foreground bg-secondary/50 rounded-lg p-3 mt-3">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                      
                      {request.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button variant="success" onClick={() => handleAccept(request.id)}>
                            <Check className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="outline" onClick={() => handleReject(request.id)}>
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="incoming" />
            )}
          </TabsContent>
          
          {/* Outgoing Requests */}
          <TabsContent value="outgoing">
            {outgoing.length > 0 ? (
              <div className="space-y-4">
                {outgoing.map((request, index) => (
                  <div
                    key={request.id}
                    className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{request.item}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>Requested from {request.owner}</span>
                          <span>•</span>
                          <span>{request.timeAgo}</span>
                        </div>
                        
                        {request.message && (
                          <p className="text-muted-foreground bg-secondary/50 rounded-lg p-3 mt-3">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="outgoing" />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EmptyState({ type }: { type: "incoming" | "outgoing" }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        {type === "incoming" ? (
          <Inbox className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Send className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === "incoming" ? "No incoming requests" : "No sent requests"}
      </h3>
      <p className="text-muted-foreground">
        {type === "incoming" 
          ? "When someone wants to borrow your items, you'll see their requests here"
          : "When you request to borrow items, you'll track them here"
        }
      </p>
    </div>
  );
}
