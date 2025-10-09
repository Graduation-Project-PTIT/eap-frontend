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

export interface EvaluationWorkflowResult {
  extractedInformation: ERDExtractionResult;
  evaluationReport: string;
}

export interface EvaluationRequest {
  erdImage: string; // URL to the ERD image
  questionDescription: string; // Description of the evaluation objective
  userToken?: string; // User access token for file authentication
  workflowMode?: "standard" | "sync"; // Workflow mode: standard (with refinement) or sync (direct evaluation)
}

export interface EvaluationWorkflowResponse {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: ERDExtractionResult | EvaluationWorkflowResult;
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

// Mastra API response format
export interface MastraWorkflowResponse {
  status: "success" | "failed" | "error" | "running" | "in_progress" | "pending" | "waiting";
  result?: ERDExtractionResult | EvaluationWorkflowResult;
  error?: string;
  payload?: Record<string, unknown>;
  steps?: Record<string, unknown>;
}

// API Functions for Mastra evaluation workflow
export const evaluationApi = {
  // Start evaluation workflow synchronously
  startEvaluation: async (data: EvaluationRequest): Promise<EvaluationWorkflowResponse> => {
    try {
      // Create headers with user token if provided
      const headers: Record<string, string> = {};
      if (data.userToken) {
        headers["X-User-Token"] = data.userToken;
      }

      // Determine which workflow to use based on mode
      const workflowName =
        data.workflowMode === "sync" ? "evaluationSyncWorkflow" : "evaluationWorkflow";

      // First create a run
      const createRunResponse = await evaluationServiceClient.post<{ runId: string }>(
        `/workflows/${workflowName}/create-run`,
        {},
        { headers },
      );

      const runId = createRunResponse.data.runId;

      if (!runId) {
        throw new Error("Failed to create evaluation run - no run ID returned");
      }

      // Then start the workflow synchronously
      const response = await evaluationServiceClient.post<MastraWorkflowResponse>(
        `/workflows/${workflowName}/start?runId=${runId}`,
        { inputData: data },
        { headers },
      );

      // Transform Mastra response format to our expected format
      const responseData = response.data;

      // Map Mastra status to our expected status
      let status: "pending" | "running" | "completed" | "failed" = "pending";
      let result = responseData.result;

      console.log("startEvaluation - Mastra response status:", responseData.status);
      console.log("startEvaluation - Mastra response result:", responseData.result);

      if (responseData.status === "success") {
        status = "completed";
        // The workflow now returns the evaluation report directly as the result
        result = responseData.result;
        console.log("startEvaluation - mapped to completed status with result:", result);
      } else if (responseData.status === "failed" || responseData.status === "error") {
        status = "failed";
      } else if (responseData.status === "running" || responseData.status === "in_progress") {
        status = "running";
      } else if (responseData.status === "waiting") {
        // When workflow is waiting, check if we have extraction results in steps
        status = "completed"; // Mark as completed for extraction step
        if (responseData.steps && typeof responseData.steps === "object") {
          const steps = responseData.steps as Record<
            string,
            { status: string; output?: ERDExtractionResult }
          >;
          const extractStep = steps["erdInformationExtractStep"];
          if (extractStep && extractStep.status === "success" && extractStep.output) {
            result = extractStep.output;
          }
        }
      }

      return {
        id: runId,
        status,
        result,
        error: responseData.error,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error starting evaluation:", error);
      throw error;
    }
  },

  // Get evaluation workflow status
  getEvaluation: async (id: string, workflowName?: string): Promise<EvaluationWorkflowResponse> => {
    const workflow = workflowName || "evaluationWorkflow";
    const response = await evaluationServiceClient.get<MastraWorkflowResponse>(
      `/workflows/${workflow}/runs/${id}`,
    );

    // Transform Mastra response format to our expected format
    const data = response.data;

    // Map Mastra status to our expected status
    let status: "pending" | "running" | "completed" | "failed" = "pending";
    let result = data.result;

    console.log("getEvaluation - Mastra response status:", data.status);
    console.log("getEvaluation - Mastra response result:", data.result);

    if (data.status === "success") {
      status = "completed";
      console.log("getEvaluation - mapped to completed status with result:", result);
    } else if (data.status === "failed" || data.status === "error") {
      status = "failed";
    } else if (data.status === "running" || data.status === "in_progress") {
      status = "running";
    } else if (data.status === "waiting") {
      // When workflow is waiting, check if we have extraction results in steps
      status = "completed"; // Mark as completed for extraction step
      if (data.steps && typeof data.steps === "object") {
        const steps = data.steps as Record<
          string,
          { status: string; output?: ERDExtractionResult }
        >;
        const extractStep = steps["erdInformationExtractStep"];
        if (extractStep && extractStep.status === "success" && extractStep.output) {
          result = extractStep.output;
        }
      }
    }

    return {
      id,
      status,
      result,
      error: data.error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // Get evaluation execution result
  getEvaluationResult: async (
    id: string,
    workflowName?: string,
  ): Promise<EvaluationWorkflowResponse> => {
    const workflow = workflowName || "evaluationWorkflow";
    const response = await evaluationServiceClient.get<MastraWorkflowResponse>(
      `/workflows/${workflow}/runs/${id}/execution-result`,
    );

    // Transform Mastra response format to our expected format
    const data = response.data;

    // Map Mastra status to our expected status
    let status: "pending" | "running" | "completed" | "failed" = "pending";
    let result = data.result;

    if (data.status === "success") {
      status = "completed";
    } else if (data.status === "failed" || data.status === "error") {
      status = "failed";
    } else if (data.status === "running" || data.status === "in_progress") {
      status = "running";
    } else if (data.status === "waiting") {
      // When workflow is waiting, check if we have extraction results in steps
      status = "completed"; // Mark as completed for extraction step
      if (data.steps && typeof data.steps === "object") {
        const steps = data.steps as Record<
          string,
          { status: string; output?: ERDExtractionResult }
        >;
        const extractStep = steps["erdInformationExtractStep"];
        if (extractStep && extractStep.status === "success" && extractStep.output) {
          result = extractStep.output;
        }
      }
    }

    return {
      id,
      status,
      result,
      error: data.error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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

  // Send event to workflow run
  sendEvent: async (
    id: string,
    event: string,
    data?: Record<string, unknown>,
    workflowName?: string,
  ): Promise<void> => {
    const workflow = workflowName || "evaluationWorkflow";
    const response = await evaluationServiceClient.post(
      `/workflows/${workflow}/runs/${id}/send-event`,
      { event, data: data || {} },
    );
    return response.data;
  },

  // Translate evaluation report
  translateEvaluation: async (data: TranslationRequest): Promise<TranslationResponse> => {
    try {
      console.log("Starting translation workflow...", {
        targetLanguage: data.targetLanguage,
        reportLength: data.evaluationReport.length,
      });

      // Create a run for translation workflow
      const createRunResponse = await evaluationServiceClient.post<{ runId: string }>(
        `/workflows/translationWorkflow/create-run`,
        {},
      );

      const runId = createRunResponse.data.runId;
      console.log("Translation run created:", runId);

      if (!runId) {
        throw new Error("Failed to create translation run - no run ID returned");
      }

      // Start the translation workflow (async)
      await evaluationServiceClient.post<{ message: string }>(
        `/workflows/translationWorkflow/start?runId=${runId}`,
        { inputData: data },
      );

      console.log("Translation workflow started, polling for results...");

      // Poll for results (similar to how evaluation workflow works)
      const maxAttempts = 60; // 60 attempts
      const pollInterval = 2000; // 2 seconds
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;

        // Wait before polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        // Get the run status
        const statusResponse = await evaluationServiceClient.get<{
          snapshot?: {
            status?: string;
            result?: TranslationResponse;
            context?: { error?: string };
          };
        }>(`/workflows/translationWorkflow/runs/${runId}`);

        const runData = statusResponse.data;
        console.log(`Translation poll attempt ${attempts}:`, {
          status: runData.snapshot?.status,
          hasResult: !!runData.snapshot?.result,
        });

        // Check if completed successfully (status is in snapshot)
        const status = runData.snapshot?.status;
        if (status === "success" || status === "completed") {
          console.log("Translation completed successfully");

          // Extract the result - it's in snapshot.result.translatedReport
          const result = runData.snapshot?.result;
          if (result && result.translatedReport) {
            console.log("Found translatedReport, length:", result.translatedReport.length);
            return { translatedReport: result.translatedReport };
          } else {
            console.error("Translation completed but no translatedReport found:", runData);
            throw new Error("Translation completed but result is missing");
          }
        }

        // Check if failed
        if (status === "failed" || status === "error") {
          const errorMsg = runData.snapshot?.context?.error || "Translation failed";
          console.error("Translation workflow failed:", errorMsg);
          throw new Error(errorMsg);
        }

        // Continue polling if still running
        console.log(`Translation still running, attempt ${attempts}/${maxAttempts}...`);
      }

      // Timeout
      throw new Error("Translation timeout - workflow did not complete in time");
    } catch (error) {
      console.error("Error translating evaluation:", error);
      throw error;
    }
  },
};

// React Query Hooks
export interface UseStartEvaluationOptions {
  onSuccess?: (data: EvaluationWorkflowResponse) => void;
  onError?: (error: unknown) => void;
}

export const useStartEvaluation = ({ onSuccess, onError }: UseStartEvaluationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationApi.startEvaluation,
    onSuccess: (data) => {
      // Invalidate evaluation lists to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.lists() });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
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

export const useEvaluation = (id: string, enabled = true, workflowName?: string) => {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: async () => {
      try {
        // First try to get the execution result
        return await evaluationApi.getEvaluationResult(id, workflowName);
      } catch {
        // If execution result is not available, fall back to run status
        return await evaluationApi.getEvaluation(id, workflowName);
      }
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      // Only poll if we have data and it's still processing
      const data = query.state.data;
      console.log("useEvaluation - polling check, data:", data);

      if (data) {
        // Continue polling if status is pending, running, or if we don't have evaluation results yet
        if (data.status === "pending" || data.status === "running") {
          console.log("useEvaluation - continuing poll (status:", data.status, ")");
          return 2000; // 2 seconds
        }

        // If status is completed, check if we have evaluation report
        if (data.status === "completed") {
          console.log("useEvaluation - status is completed, checking result:", data.result);

          if (data.result) {
            const hasEvaluationReport =
              typeof data.result === "object" &&
              data.result !== null &&
              "evaluationReport" in data.result;

            console.log("useEvaluation - hasEvaluationReport:", hasEvaluationReport);

            if (hasEvaluationReport) {
              console.log("useEvaluation - stopping poll (completed with evaluation report)");
              return false; // Stop polling - we have the evaluation report
            } else {
              console.log("useEvaluation - continuing poll (completed but no evaluation report)");
              return 2000; // Keep polling for evaluation report
            }
          } else {
            console.log("useEvaluation - continuing poll (completed but no result)");
            return 2000; // Keep polling for result
          }
        }
      }

      console.log("useEvaluation - stopping poll");
      return false; // Stop polling when completed with results, failed, or no data
    },
    staleTime: 0, // Always consider data stale to allow polling
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (run not found)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Refetch when component mounts
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

export interface UseSendEventOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useSendEvent = ({ onSuccess, onError }: UseSendEventOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      event,
      data,
      workflowName,
    }: {
      id: string;
      event: string;
      data?: Record<string, unknown>;
      workflowName?: string;
    }) => evaluationApi.sendEvent(id, event, data, workflowName),
    onSuccess: (_, { id }) => {
      // Invalidate the specific evaluation to refresh its status
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.detail(id) });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
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

// Translation API
export interface TranslationRequest {
  evaluationReport: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedReport: string;
}

// Hook for translation
interface UseTranslateEvaluationOptions {
  onSuccess?: (data: TranslationResponse) => void;
  onError?: (error: Error) => void;
}

export const useTranslateEvaluation = ({
  onSuccess,
  onError,
}: UseTranslateEvaluationOptions = {}) => {
  return useMutation({
    mutationFn: (data: TranslationRequest) => evaluationApi.translateEvaluation(data),
    onSuccess,
    onError: (error) => {
      onError?.(error as Error);
    },
  });
};
