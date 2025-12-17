import type { FC } from "react";
import { useState, useEffect, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Maximize,
  Minimize,
  Undo,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { ERDFormatTabs } from "@/components/erd";
import { useSendFinishRefinementEvent } from "@/api";
import { toast } from "@/lib/toast";
import type { DBExtractionResult, DBEntity } from "@/api/services/evaluation-service";

interface ManualRefineStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ManualRefineStep: FC<ManualRefineStepProps> = ({ onNext, onBack }) => {
  const { state, setRefinedData, setLoading, setError } = useWorkflow();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Undo functionality
  const [history, setHistory] = useState<DBExtractionResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoingRef = useRef(false);
  const lastSavedDataRef = useRef<string>("");

  // Hook for sending finish-refinement event to the workflow
  const sendFinishRefinement = useSendFinishRefinementEvent({
    onSuccess: () => {
      toast.success("Refinements saved! Proceeding to evaluation...");
      setLoading(false);
      onNext();
    },
    onError: (error) => {
      console.error("Failed to send refinement event:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save refinements";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    },
  });

  // Use extracted data from workflow state, or fallback to empty structure
  const extractedData = state.extractedData || { entities: [], ddlScript: "", mermaidDiagram: "" };
  const refinedData = state.refinedData || extractedData;

  // Initialize refined data with extracted data when component mounts
  useEffect(() => {
    if (state.extractedData && !state.refinedData) {
      setRefinedData(state.extractedData);
    }
  }, [state.extractedData, state.refinedData, setRefinedData]);

  // Add to history when refined data changes (but not during undo)
  useEffect(() => {
    if (refinedData && !isUndoingRef.current) {
      const currentDataString = JSON.stringify(refinedData);

      // Only add to history if the data has actually changed
      if (currentDataString !== lastSavedDataRef.current) {
        setHistory((prev) => {
          const currentIndex = historyIndex;
          // Remove any future history if we're not at the end
          const newHistory = prev.slice(0, currentIndex + 1);
          newHistory.push(refinedData);
          return newHistory.slice(-50); // Keep last 50 states
        });
        setHistoryIndex((prev) => prev + 1);
        lastSavedDataRef.current = currentDataString;
      }
    }

    // Reset the undo flag
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
    }
  }, [refinedData, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoingRef.current = true;
      const previousData = history[historyIndex - 1];
      setRefinedData(previousData);
      setHistoryIndex((prev) => prev - 1);
      lastSavedDataRef.current = JSON.stringify(previousData);
    }
  }, [historyIndex, history, setRefinedData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  const handleDataChange = (updatedData: DBExtractionResult) => {
    if (!isUndoingRef.current) {
      setRefinedData(updatedData);
    }
  };

  const handleResetToOriginal = () => {
    if (state.extractedData) {
      setRefinedData(state.extractedData);
    }
  };

  const handleSaveRefinements = () => {
    // Check if we have an evaluation ID to send the event to
    if (!state.evaluationId) {
      setError("No evaluation ID found. Please restart the workflow.");
      toast.error("No evaluation ID found. Please restart the workflow.");
      return;
    }

    // Check if we have data to send (either refined or extracted)
    const dataToSend = state.refinedData || state.extractedData;
    if (!dataToSend || !dataToSend.entities || dataToSend.entities.length === 0) {
      setError("No data available to save. Please complete the extraction step first.");
      toast.error("No data available to save. Please complete the extraction step first.");
      return;
    }

    setLoading(true);

    // Send the "finish-refinement" event to the workflow with the refined data
    sendFinishRefinement.mutate({
      id: state.evaluationId!,
      extractedInformation: dataToSend,
    });
  };

  const handleAddEntity = () => {
    const newEntity: DBEntity = {
      name: "new_entity",
      attributes: [
        {
          name: "id",
          type: "INT",
          primaryKey: true,
          foreignKey: false,
          unique: true,
          nullable: false,
        },
      ],
    };

    const updatedData = {
      entities: [...refinedData.entities, newEntity],
      ddlScript: refinedData.ddlScript,
      mermaidDiagram: refinedData.mermaidDiagram,
    };
    setRefinedData(updatedData);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5" />
                <span className="text-lg font-semibold">Manually Refine Extracted Data</span>
                <Badge variant="outline" className="text-xs">
                  Press ESC to exit fullscreen
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Ctrl+Z / Cmd+Z to undo
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleResetToOriginal}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Original
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddEntity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title={`Undo (Ctrl+Z / Cmd+Z) - ${historyIndex} steps available`}
                >
                  <Undo className="h-4 w-4 mr-1" />
                  Undo {historyIndex > 0 && `(${historyIndex})`}
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Minimize className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            </div>
          </div>

          {/* Fullscreen ERD Format Tabs */}
          <div className="flex-1 p-4">
            {refinedData.entities.length > 0 ? (
              <ERDFormatTabs
                data={refinedData}
                onDataChange={handleDataChange}
                isEditable={true}
                className="w-full h-full"
                preferredFormat={state.preferredFormat}
              />
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Refine</h3>
                <p className="text-gray-500">
                  Please complete the extraction step first to get data for refinement.
                </p>
              </div>
            )}
          </div>

          {/* Fullscreen Footer */}
          <div className="border-t bg-background p-4">
            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Extract
              </Button>
              <Button onClick={handleSaveRefinements}>
                <Save className="h-4 w-4 mr-2" />
                Save & Continue to Evaluation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Edit3 className="h-5 w-5" />
          <span className="text-lg font-semibold">Manually Refine Extracted Data</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleResetToOriginal}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Original
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddEntity}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title={`Undo (Ctrl+Z / Cmd+Z) - ${historyIndex} steps available`}
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo {historyIndex > 0 && `(${historyIndex})`}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* ERD Format Tabs */}
      {refinedData.entities.length > 0 ? (
        <ERDFormatTabs
          data={refinedData}
          onDataChange={handleDataChange}
          isEditable={true}
          className="w-full h-[60vh]"
          preferredFormat={state.preferredFormat}
        />
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Refine</h3>
          <p className="text-gray-500">
            Please complete the extraction step first to get data for refinement.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Extract
        </Button>
        <Button onClick={handleSaveRefinements}>
          <Save className="h-4 w-4 mr-2" />
          Save & Continue to Evaluation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ManualRefineStep;
