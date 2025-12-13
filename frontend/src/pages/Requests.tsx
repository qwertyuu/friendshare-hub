import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send } from "lucide-react";

export default function Requests() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Emprunts</h1>
          <p className="text-muted-foreground">Gère les demandes d'emprunt</p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Reçues
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyées
            </TabsTrigger>
          </TabsList>
          
          {/* Incoming Requests */}
          <TabsContent value="incoming">
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucune demande reçue</h3>
              <p className="text-muted-foreground">
                Quand quelqu'un voudra t'emprunter quelque chose, ça apparaîtra ici
              </p>
            </div>
          </TabsContent>
          
          {/* Outgoing Requests */}
          <TabsContent value="outgoing">
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucune demande envoyée</h3>
              <p className="text-muted-foreground">
                Quand tu demanderas à emprunter quelque chose, ça apparaîtra ici
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
