import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Helper to update cache immediately after a mutation
 * Useful for mutations that need instant UI feedback
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateUserRole = (userId: string, newRole: "USER" | "ADMIN", queryKey: string[]) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map((user: any) =>
        user.id === userId ? { ...user, role: newRole } : user
      );
    });
  };

  const updateRequestStatus = (requestId: string, newStatus: string, queryKey: string[]) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map((request: any) =>
        request.id === requestId ? { ...request, status: newStatus } : request
      );
    });
  };

  const removeFromCache = (itemId: string, queryKey: string[]) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.filter((item: any) => item.id !== itemId);
    });
  };

  const invalidateQueries = (queryKeys: string[][]) => {
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const removeRequest = (requestId: string, queryKeys: string[][]) => {
    queryKeys.forEach((key) => {
      queryClient.setQueryData(key, (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((item: any) => item.id !== requestId);
      });
    });
  };

  return { updateUserRole, updateRequestStatus, removeFromCache, invalidateQueries, removeRequest };
}
