import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithSSO, user } = useAuth();

  // Check for auth errors from callback
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/browse");
    }
  }, [user, navigate]);

  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      await loginWithSSO();
      // User will be redirected to Authentik, no need for success message
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              <span className="text-primary">Raphartage Club</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Connexion
          </h1>
          <p className="text-muted-foreground mb-8">
            Connecte-toi pour accéder à l'inventaire partagé
          </p>

          {/* Login Button */}
          <Button
            onClick={handleSSOLogin}
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Info alert */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu seras redirigé vers la page d'authentification pour te connecter.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="text-6xl mb-6">🤝</div>
          <h2 className="text-3xl font-bold mb-4">
            Le partage simplifié
          </h2>
          <p className="text-lg opacity-90">
            Retrouve tes amis et découvre ce qu'ils peuvent te prêter.
          </p>
        </div>
      </div>
    </div>
  );
}
