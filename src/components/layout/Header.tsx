import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/browse", label: "Parcourir" },
  { to: "/demands", label: "Demandes" },
  { to: "/my-items", label: "Mes objets" },
  { to: "/requests", label: "Emprunts" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-soft group-hover:shadow-glow transition-shadow duration-300">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Le <span className="text-primary">Raphivers</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLanding ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/register">
                  <UserPlus className="h-4 w-4" />
                  S'inscrire
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Déconnexion</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {!isLanding &&
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            <div className="flex gap-2 mt-2 pt-2 border-t border-border">
              {isLanding ? (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button variant="hero" className="flex-1" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      S'inscrire
                    </Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    Déconnexion
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
