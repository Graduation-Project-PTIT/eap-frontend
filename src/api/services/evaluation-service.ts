import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { evaluationServiceClient } from "../client";
import { queryKeys } from "../query-client";

// Types based on the Mastra evaluation workflow
export interface ERDEntity {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
    primaryKey: boolean;
    foreignKey: boolean;
    unique: boolean;
    nullable: boolean;
    foreignKeyTable?: string;
    foreignKeyAttribute?: string;
    relationType?: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  }>;
}

export interface ERDExtractionResult {
  entities: ERDEntity[];
}

export interface EvaluationRequest {
  erdImage: string; // URL to the ERD image
}

export interface EvaluationWorkflowResponse {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: ERDExtractionResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface EvaluationListResponse {
  evaluations: EvaluationWorkflowResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Functions for Mastra evaluation workflow
export const evaluationApi = {
  // Start evaluation workflow
  startEvaluation: async (data: EvaluationRequest): Promise<EvaluationWorkflowResponse> => {
    const response = await evaluationServiceClient.post<EvaluationWorkflowResponse>(
      "/workflows/evaluationWorkflow/run",
      data,
    );
    return response.data;
  },

  // Get evaluation workflow status
  getEvaluation: async (id: string): Promise<EvaluationWorkflowResponse> => {
    const response = await evaluationServiceClient.get<EvaluationWorkflowResponse>(
      `/workflows/evaluationWorkflow/runs/${id}`,
    );
    return response.data;
  },

  // Get evaluation list (if supported by Mastra)
  getEvaluations: async (params: EvaluationListParams = {}): Promise<EvaluationListResponse> => {
    const response = await evaluationServiceClient.get<EvaluationListResponse>(
      "/workflows/evaluationWorkflow/runs",
      { params },
    );
    return response.data;
  },

  // Cancel evaluation workflow (if supported)
  cancelEvaluation: async (id: string): Promise<void> => {
    const response = await evaluationServiceClient.post(
      `/workflows/evaluationWorkflow/runs/${id}/cancel`,
    );
    return response.data;
  },
};

// React Query Hooks
export const useStartEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationApi.startEvaluation,
    onSuccess: () => {
      // Invalidate evaluation lists to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.lists() });
    },
  });
};

export const useEvaluations = (params: EvaluationListParams = {}) => {
  return useQuery({
    queryKey: queryKeys.evaluations.list(params),
    queryFn: () => evaluationApi.getEvaluations(params),
    staleTime: 1000 * 30, // 30 seconds (shorter for real-time updates)
  });
};

export const useEvaluation = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: () => evaluationApi.getEvaluation(id),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      // Auto-refresh if evaluation is still processing
      if (query.state.data?.status === "pending" || query.state.data?.status === "running") {
        return 2000; // 2 seconds
      }
      return false;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCancelEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationApi.cancelEvaluation,
    onSuccess: (_, id) => {
      // Invalidate the specific evaluation to refresh its status
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.detail(id) });
      // Invalidate evaluation lists
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.lists() });
    },
  });
};

// Utility hooks
export const usePrefetchEvaluation = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.evaluations.detail(id),
      queryFn: () => evaluationApi.getEvaluation(id),
      staleTime: 1000 * 60 * 2,
    });
  };
};

export const useInvalidateEvaluations = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all });
  };
};
