import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backendServiceClient } from "../client";
import { queryKeys } from "../query-client";

// Types
export interface MassEvaluationTask {
  id: string;
  batchId: string;
  fileKey: string;
  status: "pending" | "processing" | "completed" | "failed";
  score: number | null;
  evaluationReport: string | null;
  workflowRunId: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MassEvaluationBatch {
  id: string;
  questionDescription: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageScore: number | null;
  createdAt: string;
  updatedAt: string;
  tasks?: MassEvaluationTask[];
}

export interface CreateBatchRequest {
  questionDescription: string;
  fileKeys: string[];
}

export interface CreateBatchResponse {
  data: MassEvaluationBatch;
}

export interface BatchListData {
  data: MassEvaluationBatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BatchDetailResponse {
  data: MassEvaluationBatch;
}

export interface BatchListFilters {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// API Functions
export const massEvaluationApi = {
  // Get all batches - GET /mass-evaluation/batches
  getBatches: async (filters?: BatchListFilters): Promise<BatchListData> => {
    const response = await backendServiceClient.get<BatchListData>("/mass-evaluation/batches", {
      params: filters,
    });
    return response.data;
  },

  // Get single batch - GET /mass-evaluation/batches/:id
  getBatch: async (batchId: string): Promise<MassEvaluationBatch> => {
    const response = await backendServiceClient.get<MassEvaluationBatch>(
      `/mass-evaluation/batches/${batchId}`,
    );
    return response.data;
  },

  // Create batch - POST /mass-evaluation/batches
  createBatch: async (data: CreateBatchRequest): Promise<MassEvaluationBatch> => {
    const response = await backendServiceClient.post<MassEvaluationBatch>(
      "/mass-evaluation/batches",
      data,
    );
    return response.data;
  },

  // Delete batch - DELETE /mass-evaluation/batches/:id
  deleteBatch: async (batchId: string): Promise<void> => {
    await backendServiceClient.delete(`/mass-evaluation/batches/${batchId}`);
  },

  // Start batch evaluation - POST /mass-evaluation/batches/:id/start
  startBatch: async (batchId: string): Promise<void> => {
    await backendServiceClient.post(`/mass-evaluation/batches/${batchId}/start`);
  },

  // Retry failed task - POST /mass-evaluation/tasks/:id/retry
  retryTask: async (taskId: string): Promise<void> => {
    await backendServiceClient.post(`/mass-evaluation/tasks/${taskId}/retry`);
  },
};

// React Query Hooks
export const useBatches = (filters?: BatchListFilters) => {
  return useQuery({
    queryKey: queryKeys.massEvaluation.batchList(filters || {}),
    queryFn: () => massEvaluationApi.getBatches(filters),
    staleTime: 1000 * 5, // 5 seconds - short stale time for real-time updates
    refetchInterval: (query) => {
      // Auto-refresh every 5 seconds if there are processing batches
      const data = query.state.data;
      if (data?.data?.some((batch) => batch.status === "processing")) {
        return 5000;
      }
      return false;
    },
  });
};

export const useBatch = (batchId: string) => {
  return useQuery({
    queryKey: queryKeys.massEvaluation.batchDetail(batchId),
    queryFn: () => massEvaluationApi.getBatch(batchId),
    staleTime: 1000 * 3, // 3 seconds
    refetchInterval: (query) => {
      // Auto-refresh every 3 seconds if batch is processing
      const data = query.state.data;
      if (data?.status === "processing") {
        return 3000;
      }
      return false;
    },
    enabled: !!batchId,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: massEvaluationApi.createBatch,
    onSuccess: () => {
      // Invalidate batch lists to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.massEvaluation.batches() });
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: massEvaluationApi.deleteBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.massEvaluation.batches() });
    },
  });
};

export const useStartBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: massEvaluationApi.startBatch,
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.massEvaluation.batchDetail(batchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.massEvaluation.batches() });
    },
  });
};

export const useRetryTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: massEvaluationApi.retryTask,
    onSuccess: () => {
      // Invalidate all batch queries to refresh task status
      queryClient.invalidateQueries({ queryKey: queryKeys.massEvaluation.all });
    },
  });
};
