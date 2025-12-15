import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { UserCard } from "@/components/admin/UserCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { toast } from "sonner";
import { useOptimisticUpdate } from "@/utils/mutations";

export default function Admin() {
  const { updateUserRole, invalidateQueries } = useOptimisticUpdate();

  // Fetch pending users
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-users-pending"],
    queryFn: async () => {
      const response = await api.getUsers("PENDING");
      return response.users || response || [];
    },
  });

  // Fetch approved users
  const { data: approvedData, isLoading: approvedLoading } = useQuery({
    queryKey: ["admin-users-approved"],
    queryFn: async () => {
      const response = await api.getUsers("APPROVED");
      return response.users || response || [];
    },
  });

  // Fetch rejected users
  const { data: rejectedData, isLoading: rejectedLoading } = useQuery({
    queryKey: ["admin-users-rejected"],
    queryFn: async () => {
      const response = await api.getUsers("REJECTED");
      return response.users || response || [];
    },
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: (id: string) => api.approveUser(id),
    onSuccess: () => {
      toast.success("Utilisateur approuvé!");
      invalidateQueries([["admin-users-pending"], ["admin-users-approved"]]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'approbation");
    },
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: (id: string) => api.rejectUser(id),
    onSuccess: () => {
      toast.success("Utilisateur rejeté!");
      invalidateQueries([["admin-users-pending"], ["admin-users-rejected"]]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors du rejet");
    },
  });

  // Promote user to admin mutation
  const promoteUserMutation = useMutation({
    mutationFn: (id: string) => api.promoteUser(id),
    onSuccess: (_, userId) => {
      toast.success("Utilisateur promu administrateur!");
      updateUserRole(userId, "ADMIN", ["admin-users-approved"]);
      invalidateQueries([
        ["admin-users-pending"],
        ["admin-users-approved"],
        ["admin-users-rejected"],
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la promotion");
    },
  });

  // Demote user from admin mutation
  const demoteUserMutation = useMutation({
    mutationFn: (id: string) => api.demoteUser(id),
    onSuccess: (_, userId) => {
      toast.success("Utilisateur rétrogradé!");
      updateUserRole(userId, "USER", ["admin-users-approved"]);
      invalidateQueries([
        ["admin-users-pending"],
        ["admin-users-approved"],
        ["admin-users-rejected"],
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la rétrogradation");
    },
  });

  if (pendingLoading || approvedLoading || rejectedLoading) return <LoadingSpinner />;

  const pendingUsers = Array.isArray(pendingData) ? pendingData : [];
  const approvedUsers = Array.isArray(approvedData) ? approvedData : [];
  const rejectedUsers = Array.isArray(rejectedData) ? rejectedData : [];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
            </div>
            <p className="text-muted-foreground">
              Approuve ou rejette les demandes d'inscription
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-muted-foreground">En attente</span>
              </div>
              <p className="text-2xl font-bold">{pendingUsers.length}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Approuvés</span>
              </div>
              <p className="text-2xl font-bold">{approvedUsers.length}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-muted-foreground">Rejetés</span>
              </div>
              <p className="text-2xl font-bold">{rejectedUsers.length}</p>
            </div>
          </div>

          {/* Users by Status */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En attente ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approuvés ({approvedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejetés ({rejectedUsers.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Users */}
            <TabsContent value="pending">
              {pendingUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onApprove={(id) => approveUserMutation.mutate(id)}
                      onReject={(id) => rejectUserMutation.mutate(id)}
                      isLoading={approveUserMutation.isPending || rejectUserMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun utilisateur en attente
                  </h3>
                  <p className="text-muted-foreground">Tous les utilisateurs ont été traités!</p>
                </div>
              )}
            </TabsContent>

            {/* Approved Users */}
            <TabsContent value="approved">
              {approvedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onPromote={(id) => promoteUserMutation.mutate(id)}
                      onDemote={(id) => demoteUserMutation.mutate(id)}
                      isLoading={promoteUserMutation.isPending || demoteUserMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun utilisateur approuvé
                  </h3>
                  <p className="text-muted-foreground">Les utilisateurs approuvés apparaîtront ici</p>
                </div>
              )}
            </TabsContent>

            {/* Rejected Users */}
            <TabsContent value="rejected">
              {rejectedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun utilisateur rejeté
                  </h3>
                  <p className="text-muted-foreground">Les utilisateurs rejetés apparaîtront ici</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
