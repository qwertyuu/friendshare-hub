import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * This page handles the OIDC callback redirect.
 * The backend will process the callback and redirect to /browse or /login?error=auth_failed
 */
export default function AuthCallback() {
  useEffect(() => {
    // The backend /api/auth/callback endpoint will handle this automatically
    // This page is just a loading state in case there's a delay
    const timeout = setTimeout(() => {
      // If still on this page after 5 seconds, something went wrong
      window.location.href = "/login?error=auth_failed";
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Connexion en cours...</h2>
        <p className="text-muted-foreground">
          Tu vas être redirigé dans un instant.
        </p>
      </div>
    </div>
  );
}
