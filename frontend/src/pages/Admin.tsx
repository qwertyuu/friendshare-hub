import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { User } from "@/types";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-statistics"],
    queryFn: async () => await api.getAdminStatistics(),
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.getUsers();
      return response.users || response || [];
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Utilisateur supprimé");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${userName} ?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (statsLoading || usersLoading) return <LoadingSpinner />;

  const users = Array.isArray(usersData) ? usersData : [];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de bord Admin
              </h1>
            </div>
            <p className="text-muted-foreground">
              Vue d'ensemble de la plateforme
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Users Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users?.admins || 0} admins, {stats?.users?.users || 0} users
                </p>
              </CardContent>
            </Card>

            {/* Items Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Objets</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.items?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.items?.available || 0} disponibles, {stats?.items?.borrowed || 0} empruntés
                </p>
              </CardContent>
            </Card>

            {/* Borrow Requests Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emprunts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.requests?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  actifs · {stats?.requests?.pending || 0} en attente
                </p>
              </CardContent>
            </Card>

            {/* General Requests Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Demandes
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.generalRequests?.open || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  ouvertes · {stats?.generalRequests?.total || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Statistiques détaillées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Utilisateurs</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {stats?.users?.total || 0} total ({stats?.users?.admins || 0} admins, {stats?.users?.users || 0} users)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Objets</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {stats?.items?.total || 0} total</li>
                  <li>• {stats?.items?.available || 0} disponibles</li>
                  <li>• {stats?.items?.borrowed || 0} empruntés</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Emprunts</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {stats?.requests?.active || 0} actifs</li>
                  <li>• {stats?.requests?.pending || 0} en attente</li>
                  <li>• {stats?.requests?.approved || 0} approuvés</li>
                  <li>• {stats?.requests?.total || 0} total</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Demandes générales
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {stats?.generalRequests?.open || 0} ouvertes</li>
                  <li>• {stats?.generalRequests?.total || 0} total</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Utilisateurs
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Les rôles sont gérés via les groupes LDAP dans Authentik
              </p>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user: User) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{user.name}</p>
                          <Badge
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                          >
                            {user.role === "ADMIN" ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : null}
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun utilisateur
                  </h3>
                  <p className="text-muted-foreground">
                    Les utilisateurs apparaîtront ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
