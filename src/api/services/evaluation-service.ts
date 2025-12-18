import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiServiceClient } from "../client";
import { queryKeys } from "../query-client";
import type { ERDEntity, ERDRelationship } from "@/components/erd/erd-diagram-view/types";

export interface DBEntity {
  name: string;
  attributes: DBAttribute[];
}

export interface DBAttribute {
  name: string;
  type: string;
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  nullable: boolean;
  foreignKeyTable?: string;
  foreignKeyAttribute?: string;
  relationType?: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

export interface DBExtractionResult {
  type: "PHYSICAL_DB";
  entities: DBEntity[];
  ddlScript: string;
  mermaidDiagram: string;
}

export interface ERDExtractionResult {
  type: "ERD";
  entities: ERDEntity[];
  relationships: ERDRelationship[];
}

export interface EvaluationWorkflowResult {
  erdEvaluationStep?: {
    score: number;
    evaluationReport: string;
  };
  dbEvaluationStep?: {
    score: number;
    evaluationReport: string;
  };
}

export interface EvaluationRequest {
  fileKey: string;
  questionDescription: string;
  userToken?: string;
  workflowMode?: "standard" | "sync";
  preferredFormat?: "json" | "ddl" | "mermaid";
}

// Database evaluation record type from backend
export interface EvaluationRecord {
  id: string;
  userId: string;
  questionDescription: string;
  fileKey: string;
  extractedInformation?: DBExtractionResult | ERDExtractionResult;
  diagramType?: "ERD" | "PHYSICAL_DB";
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
  result?: DBExtractionResult | ERDExtractionResult | EvaluationWorkflowResult;
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
  result?: DBExtractionResult | EvaluationWorkflowResult;
  error?: string;
  payload?: Record<string, unknown>;
  steps?: Record<string, unknown>;
}

// Helper function to convert EvaluationRecord to EvaluationWorkflowResponse
function toWorkflowResponse(record: EvaluationRecord): EvaluationWorkflowResponse {
  let result: DBExtractionResult | ERDExtractionResult | EvaluationWorkflowResult | undefined;

  if (record.diagramType === "ERD" && record.evaluationReport) {
    result = {
      erdEvaluationStep: {
        score: record.score || 0,
        evaluationReport: record.evaluationReport,
      },
    };
  } else if (record.diagramType === "PHYSICAL_DB" && record.evaluationReport) {
    result = {
      dbEvaluationStep: {
        score: record.score || 0,
        evaluationReport: record.evaluationReport,
      },
    };
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
        fileKey: data.fileKey,
        workflowMode: data.workflowMode || "standard",
        preferredFormat: data.preferredFormat || "mermaid",
      });

      // Call new custom API endpoint
      // Note: baseURL already includes /ai, so we use /evaluations as the path
      const response = await aiServiceClient.post<EvaluationRecord>(
        `/evaluations`,
        {
          questionDescription: data.questionDescription,
          fileKey: data.fileKey,
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

    // Note: baseURL already includes /ai, so we use /evaluations/${id} as the path
    const response = await aiServiceClient.get<EvaluationRecord>(`/evaluations/${id}`);

    console.log("getEvaluation - received record:", response.data);

    // Convert database record to workflow response format
    return toWorkflowResponse(response.data);
  },

  // Get evaluation execution result from workflow
  getEvaluationResult: async (id: string): Promise<EvaluationWorkflowResponse> => {
    console.log("getEvaluationResult - fetching workflow result for evaluation:", id);

    const response = await aiServiceClient.get<MastraWorkflowResponse>(`/evaluations/${id}/result`);

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
        const steps = data.steps as Record<string, { status: string; output?: DBExtractionResult }>;
        const extractStep = steps["erdInformationExtractStep"] || steps["dbInformationExtractStep"];
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

    const response = await aiServiceClient.get<EvaluationRecord[]>("/evaluations", { params });

    console.log("getEvaluations - received records:", response.data.length);

    return response.data;
  },

  // Send finish-refinement event to workflow
  sendFinishRefinementEvent: async (
    id: string,
    extractedInformation: DBExtractionResult | ERDExtractionResult,
  ): Promise<{ success: boolean }> => {
    console.log("sendFinishRefinementEvent - sending event for evaluation:", id);

    const response = await aiServiceClient.post(`/evaluations/${id}/finish-refinement`, {
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
        evaluationId: data.evaluationId,
        targetLanguage: data.targetLanguage,
        reportLength: data.evaluationReport.length,
      });

      // Start translation using custom route
      await aiServiceClient.post(`/evaluations/${data.evaluationId}/translation`, {
        evaluationReport: data.evaluationReport,
        targetLanguage: data.targetLanguage,
      });

      console.log("Translation workflow started, polling for results...");

      // Poll for results (similar to how evaluation workflow works)
      const maxAttempts = 60; // 60 attempts
      const pollInterval = 2000; // 2 seconds
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;

        // Wait before polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        // Get the run status - response structure is at root level, not in snapshot
        const statusResponse = await aiServiceClient.get<{
          status?: string;
          result?: {
            translatedReport?: string;
          };
          payload?: {
            evaluationReport?: string;
            targetLanguage?: string;
          };
          steps?: Record<string, unknown>;
        }>(`/evaluations/${data.evaluationId}/translation/result`);

        const runData = statusResponse.data;

        // Log the full response structure for debugging
        console.log(`Translation poll attempt ${attempts}:`, {
          status: runData.status,
          hasResult: !!runData.result,
          hasTranslatedReport: !!runData.result?.translatedReport,
          translatedReportLength: runData.result?.translatedReport?.length || 0,
        });

        // Check if completed successfully - status is at root level
        const status = runData.status;
        if (status === "success" || status === "completed") {
          console.log("Translation completed successfully, full response:", runData);

          // Extract the result - it's at root level in result.translatedReport
          const result = runData.result;
          if (result && result.translatedReport) {
            console.log("Found translatedReport, length:", result.translatedReport.length);
            console.log(
              "First 100 chars of translation:",
              result.translatedReport.substring(0, 100),
            );
            return { translatedReport: result.translatedReport };
          } else {
            console.error("Translation completed but no translatedReport found in result:", {
              hasResult: !!result,
              resultKeys: result ? Object.keys(result) : [],
              fullResponse: runData,
            });
            throw new Error("Translation completed but result is missing");
          }
        }

        // Check if failed
        if (status === "failed" || status === "error") {
          const errorMsg = "Translation failed";
          console.error("Translation workflow failed:", {
            status,
            fullResponse: runData,
          });
          throw new Error(errorMsg);
        }

        // Continue polling if still running
        console.log(
          `Translation still running (status: ${status}), attempt ${attempts}/${maxAttempts}...`,
        );
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
        return await evaluationApi.getEvaluationResult(id);
      } catch {
        return await evaluationApi.getEvaluation(id);
      }
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (data) {
        if (data.status === "pending" || data.status === "running") {
          return 2000;
        }

        // For waiting status, check if we have extraction result
        if (data.status === "waiting") {
          if (data.result && typeof data.result === "object" && "entities" in data.result) {
            return false;
          } else {
            return 2000;
          }
        }

        // If status is completed, check if we have evaluation report
        if (data.status === "completed") {
          if (
            data.result &&
            ("erdEvaluationStep" in data.result || "dbEvaluationStep" in data.result)
          ) {
            const workflowResult = data.result as EvaluationWorkflowResult;

            if (
              workflowResult.erdEvaluationStep?.evaluationReport ||
              workflowResult.dbEvaluationStep?.evaluationReport
            ) {
              return false;
            } else {
              return 2000;
            }
          } else {
            return 2000;
          }
        }
      }
      return false;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
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
      extractedInformation: DBExtractionResult | ERDExtractionResult;
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
  evaluationId: string;
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
