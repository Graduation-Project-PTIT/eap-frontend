import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import type { WorkflowStep } from "../index";
import type {
  DBExtractionResult,
  EvaluationWorkflowResponse,
} from "@/api/services/evaluation-service";

// Workflow mode type
export type WorkflowMode = "standard" | "sync";

// Preferred format type
export type PreferredFormat = "json" | "ddl" | "mermaid";

// Types for workflow state
export interface WorkflowData {
  currentStep: WorkflowStep;
  workflowMode: WorkflowMode;
  workflowName: string | null; // Track which workflow was actually used
  preferredFormat: PreferredFormat; // Format for evaluation
  questionDescription: string;
  uploadedFile: File | null;
  fileUrl: string | null;
  evaluationId: string | null;
  extractedData: DBExtractionResult | null;
  refinedData: DBExtractionResult | null;
  evaluationResults: EvaluationWorkflowResponse | null;
  selectedLanguage: string; // Language code (e.g., "en", "vi")
  isLoading: boolean;
  error: string | null;
}

// Action types
export type WorkflowAction =
  | { type: "SET_STEP"; payload: WorkflowStep }
  | { type: "SET_WORKFLOW_MODE"; payload: WorkflowMode }
  | { type: "SET_WORKFLOW_NAME"; payload: string }
  | { type: "SET_PREFERRED_FORMAT"; payload: PreferredFormat }
  | { type: "SET_QUESTION"; payload: string }
  | { type: "SET_FILE"; payload: File }
  | { type: "SET_FILE_URL"; payload: string }
  | { type: "SET_EVALUATION_ID"; payload: string }
  | { type: "SET_EXTRACTED_DATA"; payload: DBExtractionResult }
  | { type: "SET_REFINED_DATA"; payload: DBExtractionResult }
  | { type: "SET_EVALUATION_RESULTS"; payload: EvaluationWorkflowResponse }
  | { type: "SET_SELECTED_LANGUAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_WORKFLOW" };

// Initial state
const initialState: WorkflowData = {
  currentStep: "setup",
  workflowMode: "standard",
  workflowName: null,
  preferredFormat: "json", // Default to JSON
  questionDescription: "",
  uploadedFile: null,
  fileUrl: null,
  evaluationId: null,
  extractedData: null,
  refinedData: null,
  evaluationResults: null,
  selectedLanguage: "en", // Default to English
  isLoading: false,
  error: null,
};

// Reducer function
function workflowReducer(state: WorkflowData, action: WorkflowAction): WorkflowData {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_WORKFLOW_MODE":
      return { ...state, workflowMode: action.payload };
    case "SET_WORKFLOW_NAME":
      return { ...state, workflowName: action.payload };
    case "SET_PREFERRED_FORMAT":
      return { ...state, preferredFormat: action.payload };
    case "SET_QUESTION":
      return { ...state, questionDescription: action.payload };
    case "SET_FILE":
      return { ...state, uploadedFile: action.payload };
    case "SET_FILE_URL":
      return { ...state, fileUrl: action.payload };
    case "SET_EVALUATION_ID":
      return { ...state, evaluationId: action.payload };
    case "SET_EXTRACTED_DATA":
      return { ...state, extractedData: action.payload };
    case "SET_REFINED_DATA":
      return { ...state, refinedData: action.payload };
    case "SET_EVALUATION_RESULTS":
      return { ...state, evaluationResults: action.payload };
    case "SET_SELECTED_LANGUAGE":
      return { ...state, selectedLanguage: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_WORKFLOW":
      return initialState;
    default:
      return state;
  }
}

// Context type
interface WorkflowContextType {
  state: WorkflowData;
  dispatch: React.Dispatch<WorkflowAction>;
  // Helper functions
  setStep: (step: WorkflowStep) => void;
  setWorkflowMode: (mode: WorkflowMode) => void;
  setWorkflowName: (name: string) => void;
  setPreferredFormat: (format: PreferredFormat) => void;
  setQuestion: (question: string) => void;
  setFile: (file: File) => void;
  setFileUrl: (url: string) => void;
  setEvaluationId: (id: string) => void;
  setExtractedData: (data: DBExtractionResult) => void;
  setRefinedData: (data: DBExtractionResult) => void;
  setEvaluationResults: (results: EvaluationWorkflowResponse) => void;
  setSelectedLanguage: (language: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetWorkflow: () => void;
}

// Create context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Provider component
interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Helper functions
  const setStep = (step: WorkflowStep) => dispatch({ type: "SET_STEP", payload: step });
  const setWorkflowMode = (mode: WorkflowMode) =>
    dispatch({ type: "SET_WORKFLOW_MODE", payload: mode });
  const setWorkflowName = (name: string) => dispatch({ type: "SET_WORKFLOW_NAME", payload: name });
  const setPreferredFormat = (format: PreferredFormat) =>
    dispatch({ type: "SET_PREFERRED_FORMAT", payload: format });
  const setQuestion = (question: string) => dispatch({ type: "SET_QUESTION", payload: question });
  const setFile = (file: File) => dispatch({ type: "SET_FILE", payload: file });
  const setFileUrl = (url: string) => dispatch({ type: "SET_FILE_URL", payload: url });
  const setEvaluationId = (id: string) => dispatch({ type: "SET_EVALUATION_ID", payload: id });
  const setExtractedData = (data: DBExtractionResult) =>
    dispatch({ type: "SET_EXTRACTED_DATA", payload: data });
  const setRefinedData = (data: DBExtractionResult) =>
    dispatch({ type: "SET_REFINED_DATA", payload: data });
  const setEvaluationResults = (results: EvaluationWorkflowResponse) =>
    dispatch({ type: "SET_EVALUATION_RESULTS", payload: results });
  const setSelectedLanguage = (language: string) =>
    dispatch({ type: "SET_SELECTED_LANGUAGE", payload: language });
  const setLoading = (loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading });
  const setError = (error: string | null) => dispatch({ type: "SET_ERROR", payload: error });
  const resetWorkflow = () => dispatch({ type: "RESET_WORKFLOW" });

  const value: WorkflowContextType = {
    state,
    dispatch,
    setStep,
    setWorkflowMode,
    setWorkflowName,
    setPreferredFormat,
    setQuestion,
    setFile,
    setFileUrl,
    setEvaluationId,
    setExtractedData,
    setRefinedData,
    setEvaluationResults,
    setSelectedLanguage,
    setLoading,
    setError,
    resetWorkflow,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

// Hook to use workflow context
export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};
