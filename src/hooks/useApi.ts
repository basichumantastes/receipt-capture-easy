
import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { apiClient, ApiRequestConfig, ErrorHandlingOptions } from "../api/apiClient";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook personnalisé pour utiliser l'API avec React Query
 */
export function useApi() {
  const { session } = useAuth();

  /**
   * Exécute une requête GET avec React Query
   */
  function useApiQuery<TData>(
    endpoint: string,
    queryKey: string[],
    options?: {
      queryOptions?: Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">;
      errorOptions?: ErrorHandlingOptions;
      mockDelay?: number;
    }
  ) {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const config: ApiRequestConfig = {
          session,
          endpoint,
          method: "GET",
          mockDelay: options?.mockDelay
        };
        
        const result = await apiClient.request<TData>(config, options?.errorOptions);
        if (result === null) {
          throw new Error(`Aucune donnée reçue pour ${endpoint}`);
        }
        return result;
      },
      ...options?.queryOptions
    });
  }

  /**
   * Exécute une mutation avec React Query (POST, PUT, DELETE)
   */
  function useApiMutation<TData, TVariables>(
    endpoint: string,
    options?: {
      method?: "POST" | "PUT" | "DELETE";
      mutationOptions?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
      errorOptions?: ErrorHandlingOptions;
      mockDelay?: number;
    }
  ) {
    return useMutation({
      mutationFn: async (variables: TVariables) => {
        const config: ApiRequestConfig = {
          session,
          endpoint,
          method: options?.method || "POST",
          body: variables,
          mockDelay: options?.mockDelay
        };
        
        const result = await apiClient.request<TData>(config, options?.errorOptions);
        if (result === null) {
          throw new Error(`Aucune donnée reçue pour ${endpoint}`);
        }
        return result;
      },
      ...options?.mutationOptions
    });
  }

  return {
    useApiQuery,
    useApiMutation
  };
}

