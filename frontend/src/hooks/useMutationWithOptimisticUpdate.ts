import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Custom hook for mutations that need immediate UI updates (optimistic updates)
 * Automatically handles cache updates and toast notifications
 */
export function useMutationWithOptimisticUpdate<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  options: Omit<UseMutationOptions<TData, TError, TVariables>, "onSuccess" | "onError"> & {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError) => void;
    successToast: string;
    errorToastFn?: (error: TError) => string;
    queryKeysToInvalidate?: string[];
    optimisticUpdateFn?: (
      queryKey: string[],
      variables: TVariables
    ) => void;
  }
) {
  const queryClient = useQueryClient();
  const {
    onSuccess: customOnSuccess,
    onError: customOnError,
    successToast,
    errorToastFn,
    queryKeysToInvalidate = [],
    optimisticUpdateFn,
    ...mutationOptions
  } = options;

  return useMutation({
    ...mutationOptions,
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success(successToast);

      // Perform optimistic update if provided
      if (optimisticUpdateFn) {
        optimisticUpdateFn(queryKeysToInvalidate, variables);
      }

      // Invalidate queries
      if (queryKeysToInvalidate.length > 0) {
        queryClient.invalidateQueries({
          queryKey: queryKeysToInvalidate,
        });
      }

      // Call custom onSuccess if provided
      customOnSuccess?.(data, variables);
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = errorToastFn ? errorToastFn(error) : "Une erreur est survenue";
      toast.error(errorMessage);

      // Call custom onError if provided
      customOnError?.(error);
    },
  } as UseMutationOptions<TData, TError, TVariables>);
}
