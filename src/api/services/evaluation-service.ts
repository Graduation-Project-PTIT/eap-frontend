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
  // JSON format - structured data
  entities: ERDEntity[];

  // DDL format - PostgreSQL script
  ddlScript: string;

  // Mermaid format - Mermaid ERD diagram syntax
  mermaidDiagram: string;
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
  preferredFormat?: "json" | "ddl" | "mermaid"; // Format for evaluation (default: json)
}

// Database evaluation record type from backend
export interface EvaluationRecord {
  id: string;
  userId: string;
  questionDescription: string;
  erdImageUrl: string;
  extractedInformation?: ERDExtractionResult;
  score?: number;
  evaluationReport?: string;
  workflowRunId: string;
  workflowMode: "standard" | "sync";
  preferredFormat: "json" | "ddl" | "mermaid";
  status: "pending" | "running" | "completed" | "failed" | "waiting";
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationWorkflowResponse {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "waiting";
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

// Helper function to convert EvaluationRecord to EvaluationWorkflowResponse
function toWorkflowResponse(record: EvaluationRecord): EvaluationWorkflowResponse {
  let result: ERDExtractionResult | EvaluationWorkflowResult | undefined;

  // Build result object based on available data
  if (record.extractedInformation && record.evaluationReport) {
    result = {
      extractedInformation: record.extractedInformation,
      evaluationReport: record.evaluationReport,
    };
  } else if (record.extractedInformation) {
    result = record.extractedInformation;
  }

  return {
    id: record.id,
    status: record.status,
    result,
    error: undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// API Functions for custom evaluation routes
export const evaluationApi = {
  // Start evaluation workflow using custom API
  startEvaluation: async (data: EvaluationRequest): Promise<EvaluationWorkflowResponse> => {
    try {
      // Set Authorization header with user token
      const headers: Record<string, string> = {};
      if (data.userToken) {
        headers["Authorization"] = `Bearer ${data.userToken}`;
      }

      console.log("startEvaluation - calling custom API with data:", {
        questionDescription: data.questionDescription,
        erdImageUrl: data.erdImage,
        workflowMode: data.workflowMode || "standard",
        preferredFormat: data.preferredFormat || "mermaid",
      });

      // Call new custom API endpoint
      // Note: baseURL already includes /evaluation, so we use / as the path
      const response = await evaluationServiceClient.post<EvaluationRecord>(
        ``,
        {
          questionDescription: data.questionDescription,
          erdImageUrl: data.erdImage,
          workflowMode: data.workflowMode || "standard",
          preferredFormat: data.preferredFormat || "mermaid",
        },
        { headers },
      );

      console.log("startEvaluation - received response:", response.data);

      // Convert database record to workflow response format
      return toWorkflowResponse(response.data);
    } catch (error) {
      console.error("Error starting evaluation:", error);
      throw error;
    }
  },

  // Get evaluation from database
  getEvaluation: async (id: string): Promise<EvaluationWorkflowResponse> => {
    console.log("getEvaluation - fetching evaluation:", id);

    // Note: baseURL already includes /evaluation, so we use /${id} as the path
    const response = await evaluationServiceClient.get<EvaluationRecord>(`/${id}`);

    console.log("getEvaluation - received record:", response.data);

    // Convert database record to workflow response format
    return toWorkflowResponse(response.data);
  },

  // Get evaluation execution result from workflow
  getEvaluationResult: async (id: string): Promise<EvaluationWorkflowResponse> => {
    console.log("getEvaluationResult - fetching workflow result for evaluation:", id);

    // Note: baseURL already includes /evaluation, so we use /${id}/result as the path
    const response = await evaluationServiceClient.get<MastraWorkflowResponse>(`/${id}/result`);

    console.log("getEvaluationResult - received workflow response:", response.data);

    // Transform Mastra response format to our expected format
    const data = response.data;

    // Map Mastra status to our expected status
    let status: "pending" | "running" | "completed" | "failed" | "waiting" = "pending";
    let result = data.result;

    if (data.status === "success") {
      status = "completed";
    } else if (data.status === "failed" || data.status === "error") {
      status = "failed";
    } else if (data.status === "running" || data.status === "in_progress") {
      status = "running";
    } else if (data.status === "waiting") {
      status = "waiting";
      // When workflow is waiting, check if we have extraction results in steps
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

  // Get evaluation list from database
  getEvaluations: async (params: EvaluationListParams = {}): Promise<EvaluationRecord[]> => {
    console.log("getEvaluations - fetching evaluations with params:", params);

    // Note: baseURL already includes /evaluation, so we use / as the path
    const response = await evaluationServiceClient.get<EvaluationRecord[]>("/", { params });

    console.log("getEvaluations - received records:", response.data.length);

    return response.data;
  },

  // Send finish-refinement event to workflow
  sendFinishRefinementEvent: async (
    id: string,
    extractedInformation: ERDExtractionResult,
  ): Promise<{ success: boolean }> => {
    console.log("sendFinishRefinementEvent - sending event for evaluation:", id);

    // Note: baseURL already includes /evaluation, so we use /${id}/finish-refinement as the path
    const response = await evaluationServiceClient.post(`/${id}/finish-refinement`, {
      event: "finish-refinement",
      data: { extractedInformation },
    });

    console.log("sendFinishRefinementEvent - response:", response.data);

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

export const useEvaluation = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: async () => {
      try {
        // First try to get the execution result from workflow
        return await evaluationApi.getEvaluationResult(id);
      } catch {
        // If execution result is not available, fall back to database record
        return await evaluationApi.getEvaluation(id);
      }
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      // Only poll if we have data and it's still processing
      const data = query.state.data;
      console.log("useEvaluation - polling check, data:", data);

      if (data) {
        // Continue polling if status is pending or running
        if (data.status === "pending" || data.status === "running") {
          console.log("useEvaluation - continuing poll (status:", data.status, ")");
          return 2000; // 2 seconds
        }

        // For waiting status, check if we have extraction result
        if (data.status === "waiting") {
          if (data.result && typeof data.result === "object" && "entities" in data.result) {
            // We have extraction result, stop polling
            console.log("useEvaluation - stopping poll (waiting with extraction result)");
            return false;
          } else {
            // Still waiting for extraction, keep polling
            console.log("useEvaluation - continuing poll (waiting without result)");
            return 2000;
          }
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

export interface UseSendFinishRefinementEventOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useSendFinishRefinementEvent = ({
  onSuccess,
  onError,
}: UseSendFinishRefinementEventOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      extractedInformation,
    }: {
      id: string;
      extractedInformation: ERDExtractionResult;
    }) => evaluationApi.sendFinishRefinementEvent(id, extractedInformation),
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
