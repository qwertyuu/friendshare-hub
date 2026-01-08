import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Users, Package, Heart } from "lucide-react";

const categories = [
  { emoji: "🔧", name: "Outils" },
  { emoji: "🍳", name: "Cuisine" },
  { emoji: "⚽", name: "Sport" },
  { emoji: "💻", name: "Électronique" },
  { emoji: "📚", name: "Livres" },
  { emoji: "🎮", name: "Jeux" },
  { emoji: "🏕️", name: "Camping" },
  { emoji: "📦", name: "Autre" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          </div>

          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              {/* Logo */}
              <div className="inline-flex items-center gap-3 mb-8 animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <span className="text-gradient-hero">Raphartage Club</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Le club de partage entre amis
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/login">
                    Connexion
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {categories.map((category) => (
                  <span
                    key={category.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm font-medium text-muted-foreground shadow-soft"
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Simple description */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Prête et emprunte des objets avec tes amis.
                Connecte-toi pour accéder à l'inventaire partagé.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12">
          <div className="container text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Raphartage Club</span> = Raphaël + Partage
            </p>
            <p className="mt-2 text-sm text-muted-foreground flex items-center justify-center gap-1">
              Fait avec <Heart className="h-4 w-4 text-destructive inline" /> pour les amis
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
