import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { PendingApprovalScreen } from "./PendingApprovalScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "ADMIN";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  // Check if user is approved
  if (user.status !== "APPROVED") {
    return <PendingApprovalScreen />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Accès non autorisé</h1>
          <p className="text-muted-foreground mt-2">Vous n'avez pas les permissions requises.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
