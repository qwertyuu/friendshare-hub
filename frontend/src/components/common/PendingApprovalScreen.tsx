import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function PendingApprovalScreen() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">En attente d'approbation</h1>
          <p className="text-muted-foreground">
            Votre compte est en attente d'approbation par un administrateur. Vous serez notifié dès que votre demande sera traitée.
          </p>
          <Alert className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              Cela peut prendre quelques heures.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleLogout} className="w-full mt-6">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </Card>
    </div>
  );
}
