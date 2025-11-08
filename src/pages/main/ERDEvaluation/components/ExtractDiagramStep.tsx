import type { FC } from "react";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { useEvaluation } from "@/api";
import { toast } from "@/lib/toast";
import ErrorDisplay from "./ErrorDisplay";

interface ExtractDiagramStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ExtractDiagramStep: FC<ExtractDiagramStepProps> = ({ onNext, onBack }) => {
  const { state, setExtractedData, setError } = useWorkflow();

  // Get evaluation status using the evaluation ID from workflow state
  const { data: evaluation, error: evaluationError } = useEvaluation(
    state.evaluationId!,
    !!state.evaluationId,
  );

  // Update workflow state when evaluation completes
  useEffect(() => {
    // Check if extraction is complete (either "completed" or "waiting" status with result)
    if (
      (evaluation?.status === "completed" || evaluation?.status === "waiting") &&
      evaluation.result &&
      !state.extractedData
    ) {
      console.log("ExtractDiagramStep - extraction complete, status:", evaluation.status);
      console.log("ExtractDiagramStep - result:", evaluation.result);

      // Handle both ERDExtractionResult and EvaluationWorkflowResult types
      const extractedData =
        "entities" in evaluation.result
          ? evaluation.result
          : evaluation.result.extractedInformation;

      console.log("ExtractDiagramStep - setting extracted data and moving to next step");
      setExtractedData(extractedData);

      // Show success toast and automatically navigate to the next step (refine)
      toast.success("Extraction completed successfully!");
      onNext();
    }
    if ((evaluation?.status === "failed" || evaluationError) && !state.error) {
      setError(evaluation?.error || "Evaluation failed");
    }
  }, [
    evaluation,
    evaluationError,
    setExtractedData,
    setError,
    state.extractedData,
    state.error,
    onNext,
  ]);

  const statusDisplay = useMemo(() => {
    if (!evaluation) {
      return {
        icon: <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />,
        title: "Starting Evaluation...",
        description: "Connecting to the evaluation service",
        progress: 15,
      };
    }

    switch (evaluation.status) {
      case "pending":
        return {
          icon: <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />,
          title: "Queued for Processing",
          description: "Your ERD is in the processing queue",
          progress: 25,
        };
      case "running":
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />,
          title: "Processing ERD Image",
          description: "AI is analyzing your ERD and extracting entities and relationships",
          progress: 60,
        };
      case "waiting":
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: "Extraction Complete!",
          description: "Successfully extracted entities and relationships - ready for refinement",
          progress: 100,
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: "Extraction Complete!",
          description: "Successfully extracted entities and relationships from your ERD",
          progress: 100,
        };
      case "failed":
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: "Extraction Failed",
          description: evaluation.error || "An error occurred during processing",
          progress: 0,
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />,
          title: "Processing...",
          description: "Processing your ERD image",
          progress: 50,
        };
    }
  }, [evaluation]);

  const isCompleted = evaluation?.status === "completed" || evaluation?.status === "waiting";
  const isFailed = evaluation?.status === "failed";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Extract Diagram Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">{statusDisplay.icon}</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{statusDisplay.title}</h3>
            <p className="text-muted-foreground mb-6">{statusDisplay.description}</p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{statusDisplay.progress}%</span>
                </div>
                <Progress value={statusDisplay.progress} className="transition-all duration-500" />
              </div>

              {/* Extracted Data Preview */}
              {isCompleted && state.extractedData && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-left">Extracted Elements:</h4>
                    <Badge variant="outline" className="text-xs">
                      All formats extracted ✓ (JSON, DDL, Mermaid)
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Entities</h5>
                      <div className="space-y-2">
                        {state.extractedData.entities.slice(0, 3).map((entity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {entity.name}
                          </Badge>
                        ))}
                        {state.extractedData.entities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{state.extractedData.entities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Attributes</h5>
                      <div className="space-y-2">
                        {state.extractedData.entities
                          .flatMap((e) => e.attributes)
                          .slice(0, 3)
                          .map((attr, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {attr.name}
                            </Badge>
                          ))}
                        <Badge variant="outline" className="text-xs">
                          Total:{" "}
                          {state.extractedData.entities.reduce(
                            (acc, e) => acc + e.attributes.length,
                            0,
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Relationships</h5>
                      <div className="space-y-2">
                        {state.extractedData.entities
                          .flatMap((e) => e.attributes.filter((a) => a.foreignKey))
                          .slice(0, 3)
                          .map((rel, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {rel.relationType || "FK"}
                            </Badge>
                          ))}
                        <Badge variant="outline" className="text-xs">
                          Total:{" "}
                          {state.extractedData.entities.reduce(
                            (acc, e) => acc + e.attributes.filter((a) => a.foreignKey).length,
                            0,
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State for Extraction */}
              {!isCompleted && !isFailed && (
                <div className="mt-8 space-y-4">
                  <h4 className="font-medium text-left">Extracting Elements...</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Entities</h5>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Attributes</h5>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Relationships</h5>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {isFailed && (
                <div className="mt-8">
                  <ErrorDisplay
                    title="Extraction Failed"
                    message="We couldn't extract the ERD information from your image."
                    details={evaluation?.error || "Unknown error occurred during extraction"}
                    onRetry={() => window.location.reload()}
                    onBack={onBack}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
            <Button
              onClick={onNext}
              disabled={!isCompleted}
              className={isCompleted ? "" : "opacity-50 cursor-not-allowed"}
            >
              {isCompleted ? (
                <>
                  Continue to Refine
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractDiagramStep;
