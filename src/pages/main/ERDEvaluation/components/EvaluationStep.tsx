import { type FC, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Save,
  ChevronDown,
  FileText,
  Eye,
  Copy,
} from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { ERDTableTabs } from "@/components/erd";
import { useEvaluation } from "@/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  exportAsJSON,
  exportAsCSV,
  exportAsPDF,
  saveToHistory,
  generateReportId,
  type EvaluationReport,
} from "../utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import type { ERDExtractionResult } from "@/api/services/evaluation-service";

interface EvaluationStepProps {
  onBack: () => void;
}

const EvaluationStep: FC<EvaluationStepProps> = ({ onBack }) => {
  const { state, resetWorkflow, setEvaluationResults } = useWorkflow();

  // State for toggling between rendered and raw markdown
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  // Use refined data or fallback to extracted data
  const finalData = state.refinedData || state.extractedData;

  // Get the latest evaluation results from the workflow
  const { data: workflowEvaluation, refetch } = useEvaluation(
    state.evaluationId!,
    !!state.evaluationId,
    state.workflowName || undefined,
  );

  // Force a refetch when component mounts to ensure polling starts
  useEffect(() => {
    if (state.evaluationId && !workflowEvaluation) {
      refetch();
    }
  }, [state.evaluationId, workflowEvaluation, refetch]);

  // Update workflow state when evaluation completes
  useEffect(() => {
    if (workflowEvaluation?.status === "completed" && workflowEvaluation.result) {
      // Check if we have evaluation report in the new result
      const hasEvaluationReport =
        typeof workflowEvaluation.result === "object" &&
        "evaluationReport" in workflowEvaluation.result;

      // Check if current state has evaluation report
      const stateHasEvaluationReport =
        state.evaluationResults?.result &&
        typeof state.evaluationResults.result === "object" &&
        "evaluationReport" in state.evaluationResults.result;

      // Update if we don't have results yet, or if we have new results with evaluation report
      if (
        !state.evaluationResults ||
        state.evaluationResults.id !== workflowEvaluation.id ||
        (hasEvaluationReport && !stateHasEvaluationReport)
      ) {
        setEvaluationResults(workflowEvaluation);
      }
    }
  }, [workflowEvaluation, setEvaluationResults, state.evaluationResults]);

  // Check if we have actual evaluation results from the workflow
  // Check both state.evaluationResults AND workflowEvaluation directly
  const hasActualResultsFromState =
    state.evaluationResults?.status === "completed" &&
    state.evaluationResults.result &&
    typeof state.evaluationResults.result === "object" &&
    "evaluationReport" in state.evaluationResults.result;

  const hasActualResultsFromPolling =
    workflowEvaluation?.status === "completed" &&
    workflowEvaluation.result &&
    typeof workflowEvaluation.result === "object" &&
    "evaluationReport" in workflowEvaluation.result;

  const hasActualResults = hasActualResultsFromState || hasActualResultsFromPolling;

  // Show loading if we don't have results yet
  const isLoading = !hasActualResults;

  // Add a timeout to prevent infinite loading (5 minutes max)
  useEffect(() => {
    if (isLoading && !hasActualResults) {
      const timeout = setTimeout(
        () => {
          console.warn("EvaluationStep - evaluation timeout reached");
          toast.error(
            "Evaluation is taking longer than expected. Please try refreshing or contact support.",
          );
        },
        5 * 60 * 1000,
      ); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasActualResults]);

  const handleStartNewEvaluation = () => {
    resetWorkflow();
  };

  const createReport = (): EvaluationReport => {
    // Extract the evaluation report from the workflow results
    let evaluationReportText = "Evaluation report not available";
    let finalEvaluatedData = finalData || { entities: [] };

    // Try to get result from polling data first (most up-to-date), then from state
    let result = workflowEvaluation?.result;
    if (!result && state.evaluationResults?.result) {
      result = state.evaluationResults.result;
    }

    if (result && typeof result === "object") {
      if ("evaluationReport" in result && "extractedInformation" in result) {
        // New format: { extractedInformation, evaluationReport }
        const workflowResult = result as {
          extractedInformation: ERDExtractionResult;
          evaluationReport: string;
        };
        evaluationReportText = workflowResult.evaluationReport;
        finalEvaluatedData = workflowResult.extractedInformation;
      } else if ("evaluationReport" in result) {
        // Legacy format: { evaluationReport }
        evaluationReportText = String((result as { evaluationReport: string }).evaluationReport);
      }
    }

    return {
      id: generateReportId(),
      timestamp: new Date().toISOString(),
      questionDescription: state.questionDescription,
      originalData: state.extractedData || { entities: [] },
      refinedData: finalEvaluatedData,
      evaluationReport: evaluationReportText,
    };
  };

  const handleSaveToHistory = () => {
    try {
      const report = createReport();
      saveToHistory(report);
      toast.success("Evaluation saved to history successfully!");
    } catch (error) {
      console.error("Failed to save to history:", error);
      toast.error("Failed to save to history. Please try again.");
    }
  };

  const handleExportJSON = () => {
    try {
      const report = createReport();
      exportAsJSON(report);
      toast.success("Report exported as JSON successfully!");
    } catch (error) {
      console.error("Failed to export JSON:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleExportCSV = () => {
    try {
      const report = createReport();
      exportAsCSV(report);
      toast.success("Report exported as CSV successfully!");
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleExportPDF = () => {
    try {
      const report = createReport();
      exportAsPDF(report);
      toast.success("Report exported as text file successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  // Show loading state while waiting for evaluation results
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <h3 className="text-lg font-medium">AI is evaluating your ERD...</h3>
                <p className="text-muted-foreground">
                  Please wait while our AI agent analyzes your refined ERD structure and generates a
                  comprehensive evaluation report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show the ERD visualization while waiting */}
        {finalData && finalData.entities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Refined ERD Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ERDTableTabs data={finalData} isEditable={false} />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Refine
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            Evaluation in progress...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Evaluation Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              AI Evaluation Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="markdown-toggle"
                className="text-sm font-medium flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Rendered
              </Label>
              <Switch
                id="markdown-toggle"
                checked={showRawMarkdown}
                onCheckedChange={setShowRawMarkdown}
              />
              <Label
                htmlFor="markdown-toggle"
                className="text-sm font-medium flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Raw
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={showRawMarkdown ? "" : "prose prose-gray max-w-none dark:prose-invert"}>
            <div className="p-6 bg-muted rounded-lg">
              {(() => {
                // Try to get result from polling data first (most up-to-date), then from state
                let result = workflowEvaluation?.result;
                if (!result && state.evaluationResults?.result) {
                  result = state.evaluationResults.result;
                }

                if (!result || typeof result !== "object") {
                  return <p className="text-muted-foreground">Evaluation report not available</p>;
                }

                let evaluationReport = "";

                // New format: { extractedInformation, evaluationReport }
                if ("evaluationReport" in result && "extractedInformation" in result) {
                  evaluationReport = (result as { evaluationReport: string }).evaluationReport;
                }
                // Legacy format: { evaluationReport }
                else if ("evaluationReport" in result) {
                  evaluationReport = String(
                    (result as { evaluationReport: string }).evaluationReport,
                  );
                } else {
                  return <p className="text-muted-foreground">Evaluation report not available</p>;
                }

                // Show raw markdown or rendered version based on toggle
                if (showRawMarkdown) {
                  return (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => {
                          navigator.clipboard.writeText(evaluationReport);
                          toast.success("Markdown copied to clipboard!");
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono overflow-x-auto pt-12">
                        {evaluationReport}
                      </pre>
                    </div>
                  );
                } else {
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        // Custom styling for headings
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h4>
                        ),
                        // Custom styling for horizontal rules
                        hr: () => <hr className="my-6 border-t border-border" />,
                        // Custom styling for lists
                        ul: ({ children }) => (
                          <ul className="list-disc mb-4 space-y-2 pl-6">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal mb-4 space-y-2 pl-6">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        // Custom styling for code
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        // Custom styling for paragraphs
                        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                        // Custom styling for strong/bold text
                        strong: ({ children }) => (
                          <strong className="font-bold text-foreground">{children}</strong>
                        ),
                        // Custom styling for emphasis/italic text
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {evaluationReport}
                    </ReactMarkdown>
                  );
                }
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final ERD Visualization */}
      {(() => {
        // Use the final evaluated data from the workflow if available, otherwise use refined/extracted data
        let displayData = finalData;

        // Try to get result from polling data first (most up-to-date), then from state
        let result = workflowEvaluation?.result;
        if (!result && state.evaluationResults?.result) {
          result = state.evaluationResults.result;
        }

        if (result && typeof result === "object") {
          if ("extractedInformation" in result && "evaluationReport" in result) {
            displayData = (result as { extractedInformation: ERDExtractionResult })
              .extractedInformation;
          }
        }

        if (displayData && displayData.entities.length > 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Final ERD Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ERDTableTabs data={displayData} isEditable={false} />
              </CardContent>
            </Card>
          );
        }

        return null;
      })()}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" onClick={handleSaveToHistory}>
              <Save className="h-4 w-4 mr-2" />
              Save to History
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>Export as Text</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleStartNewEvaluation}>Start New Evaluation</Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Refine
        </Button>
        <div className="text-sm text-muted-foreground flex items-center">
          Evaluation completed successfully
        </div>
      </div>
    </div>
  );
};

export default EvaluationStep;
