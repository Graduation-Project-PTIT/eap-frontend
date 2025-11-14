import { QueryClient, type DefaultOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { createApiError } from "./client";

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Time in milliseconds that unused/inactive cache data remains in memory
    gcTime: 1000 * 60 * 5, // 5 minutes

    // Time in milliseconds after data is considered stale
    staleTime: 1000 * 60 * 1, // 1 minute

    // Number of times to retry failed requests
    retry: (failureCount, error: Error) => {
      // Don't retry on 4xx errors (client errors) if it's an AxiosError
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },

    // Delay between retries (exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus
    refetchOnWindowFocus: false,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Error handling
    throwOnError: false,
  },
  mutations: {
    // Number of times to retry failed mutations
    retry: (failureCount, error: Error) => {
      // Don't retry mutations on client errors if it's an AxiosError
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },

    // Delay between mutation retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

    // Error handling
    throwOnError: false,
  },
};

// Create and configure the query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Auth queries
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  // File service queries
  files: {
    all: ["files"] as const,
    lists: () => [...queryKeys.files.all, "list"] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters: Record<string, any>) => [...queryKeys.files.lists(), { filters }] as const,
    details: () => [...queryKeys.files.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    upload: () => [...queryKeys.files.all, "upload"] as const,
  },

  // Evaluation service queries
  evaluations: {
    all: ["evaluations"] as const,
    lists: () => [...queryKeys.evaluations.all, "list"] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters: Record<string, any>) =>
      [...queryKeys.evaluations.lists(), { filters }] as const,
    details: () => [...queryKeys.evaluations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.evaluations.details(), id] as const,
    results: () => [...queryKeys.evaluations.all, "results"] as const,
    result: (id: string) => [...queryKeys.evaluations.results(), id] as const,
  },

  // Mass evaluation queries
  massEvaluation: {
    all: ["mass-evaluation"] as const,
    batches: () => [...queryKeys.massEvaluation.all, "batches"] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    batchList: (filters: Record<string, any>) =>
      [...queryKeys.massEvaluation.batches(), { filters }] as const,
    batchDetails: () => [...queryKeys.massEvaluation.all, "batch-detail"] as const,
    batchDetail: (id: string) => [...queryKeys.massEvaluation.batchDetails(), id] as const,
    tasks: (batchId: string) => [...queryKeys.massEvaluation.all, "tasks", batchId] as const,
    stats: () => [...queryKeys.massEvaluation.all, "stats"] as const,
  },

  // Chat queries
  chat: {
    all: ["chat"] as const,
    conversations: () => [...queryKeys.chat.all, "conversation"] as const,
    conversation: (id: string) => [...queryKeys.chat.conversations(), id] as const,
  },
} as const;

// Utility functions for cache management
export const cacheUtils = {
  // Invalidate all queries for a service
  invalidateService: (service: keyof typeof queryKeys) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys[service].all });
  },

  // Remove all queries for a service
  removeService: (service: keyof typeof queryKeys) => {
    return queryClient.removeQueries({ queryKey: queryKeys[service].all });
  },

  // Clear all cache
  clearAll: () => {
    return queryClient.clear();
  },

  // Get cached data
  getCachedData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  // Set cached data
  setCachedData: <T>(queryKey: readonly unknown[], data: T) => {
    return queryClient.setQueryData<T>(queryKey, data);
  },

  // Prefetch query
  prefetch: <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: { staleTime?: number },
  ) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime,
    });
  },
};

// Error boundary helper for React Query errors
export const isQueryError = (error: unknown): error is Error => {
  return error instanceof Error;
};

// Helper to extract API error from React Query error
export const getApiErrorFromQueryError = (error: unknown) => {
  if (isQueryError(error)) {
    return createApiError(error);
  }
  return createApiError({ message: "Unknown query error" });
};
