import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";

export default function Info() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            À propos de Raphartage Club
          </h1>
          <p className="text-xl text-muted-foreground">
            Une plateforme de partage d'objets au sein de notre communauté
          </p>
        </div>

        {/* Content Card */}
        <Card className="max-w-3xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Qu'est-ce que Raphartage ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Raphartage Club</strong> est une plateforme communautaire
              qui permet de partager et d'emprunter des objets entre membres. Le
              nom vient de la combinaison de "Raphaël" et "Partage".
            </p>
            <p className="text-muted-foreground">
              Notre mission est de faciliter le partage de ressources au sein de
              la communauté, réduire les dépenses inutiles, et promouvoir une
              consommation plus responsable.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/login">Connexion</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
