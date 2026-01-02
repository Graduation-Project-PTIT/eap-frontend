import { type FC, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, FileText, Eye, Copy, Languages } from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import { ERDTableTabs } from "@/components/erd";
import { useEvaluation, useTranslateEvaluation } from "@/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { toast } from "@/lib/toast";
import type { EvaluationWorkflowResult } from "@/api/services/evaluation-service";
import { getLanguageByCode } from "@/config/languages";

interface EvaluationStepProps {
  onBack: () => void;
}

const EvaluationStep: FC<EvaluationStepProps> = ({ onBack }) => {
  const { state, setEvaluationResults } = useWorkflow();

  // State for toggling between rendered and raw markdown
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  // State for translation
  const [translatedReport, setTranslatedReport] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationAttempted, setTranslationAttempted] = useState(false);

  // Use refined data or fallback to extracted data
  const finalData = state.refinedData || state.extractedData;

  // Get the latest evaluation results from the workflow
  const { data: workflowEvaluation, refetch } = useEvaluation(
    state.evaluationId!,
    !!state.evaluationId,
  );

  // Translation hook
  const translateEvaluation = useTranslateEvaluation({
    onSuccess: (data) => {
      if (data.translatedReport) {
        setTranslatedReport(data.translatedReport);
        setIsTranslating(false);

        if (workflowEvaluation) {
          setEvaluationResults(workflowEvaluation);
        } else {
          console.warn("workflowEvaluation is not available after translation");
        }
      } else {
        console.error("Translation returned empty result, data:", data);
        setIsTranslating(false);
        // Show English version if translation fails
        if (workflowEvaluation) {
          setEvaluationResults(workflowEvaluation);
        }
        // Silent fallback to English - no error shown to user
        console.warn("Falling back to English version");
      }
    },
    onError: (error) => {
      console.error("=== Translation Error Callback ===");
      console.error("Translation error:", error);
      setIsTranslating(false);
      // Show English version if translation fails
      if (workflowEvaluation) {
        setEvaluationResults(workflowEvaluation);
      }
      console.warn("Translation failed, falling back to English version");
    },
  });

  // Force a refetch when component mounts to ensure polling starts
  useEffect(() => {
    if (state.evaluationId && !workflowEvaluation) {
      refetch();
    }
  }, [state.evaluationId, workflowEvaluation, refetch]);

  // Update workflow state when evaluation completes
  useEffect(() => {
    if (
      workflowEvaluation?.status === "completed" &&
      workflowEvaluation.result &&
      ("erdEvaluationStep" in workflowEvaluation.result ||
        "dbEvaluationStep" in workflowEvaluation.result)
    ) {
      const workflowResult = workflowEvaluation.result as EvaluationWorkflowResult;
      const hasEvaluationReport =
        "erdEvaluationStep" in workflowResult || "dbEvaluationStep" in workflowResult;

      // Check if current state has evaluation report
      const stateHasEvaluationReport =
        state.evaluationResults?.result &&
        typeof state.evaluationResults.result === "object" &&
        (("erdEvaluationStep" in state.evaluationResults.result &&
          state.evaluationResults.result.erdEvaluationStep?.evaluationReport) ||
          ("dbEvaluationStep" in state.evaluationResults.result &&
            state.evaluationResults.result.dbEvaluationStep?.evaluationReport));

      // Update if we don't have results yet, or if we have new results with evaluation report
      if (
        !state.evaluationResults ||
        state.evaluationResults.id !== workflowEvaluation.id ||
        (hasEvaluationReport && !stateHasEvaluationReport)
      ) {
        // Only set results immediately if language is English OR translation is already done
        if (state.selectedLanguage === "en" || translatedReport) {
          setEvaluationResults(workflowEvaluation);
        }
        // If language is not English and no translation yet, wait for translation
        // (results will be set after translation completes)
      }
    }
  }, [
    workflowEvaluation,
    setEvaluationResults,
    state.evaluationResults,
    state.selectedLanguage,
    translatedReport,
  ]);

  // Automatic translation when evaluation completes and language is not English
  useEffect(() => {
    if (
      workflowEvaluation?.status === "completed" &&
      workflowEvaluation.result &&
      typeof workflowEvaluation.result === "object" &&
      (("erdEvaluationStep" in workflowEvaluation.result &&
        workflowEvaluation.result.erdEvaluationStep?.evaluationReport) ||
        ("dbEvaluationStep" in workflowEvaluation.result &&
          workflowEvaluation.result.dbEvaluationStep?.evaluationReport)) &&
      state.selectedLanguage !== "en" &&
      state.evaluationId &&
      !translationAttempted &&
      !isTranslating &&
      !translatedReport // Don't translate if we already have a translation
    ) {
      const evaluationReport =
        workflowEvaluation.result.erdEvaluationStep?.evaluationReport ||
        workflowEvaluation.result.dbEvaluationStep?.evaluationReport ||
        "";

      setIsTranslating(true);
      setTranslationAttempted(true);

      const language = getLanguageByCode(state.selectedLanguage);

      translateEvaluation.mutate({
        evaluationId: state.evaluationId,
        evaluationReport,
        targetLanguage: language.nativeName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    workflowEvaluation?.status,
    workflowEvaluation?.id,
    state.selectedLanguage,
    translationAttempted,
    translatedReport,
  ]);

  // Check if we have actual evaluation results from the workflow
  // Check both state.evaluationResults AND workflowEvaluation directly
  const hasActualResultsFromState =
    state.evaluationResults?.status === "completed" &&
    state.evaluationResults.result &&
    ("erdEvaluationStep" in state.evaluationResults.result ||
      "dbEvaluationStep" in state.evaluationResults.result);

  const hasActualResultsFromPolling =
    workflowEvaluation?.status === "completed" &&
    workflowEvaluation.result &&
    ("erdEvaluationStep" in workflowEvaluation.result ||
      "dbEvaluationStep" in workflowEvaluation.result);

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

  if (isLoading || (isTranslating && !state.evaluationResults)) {
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
                <h3 className="text-lg font-medium">AI is evaluating your diagram...</h3>
                <p className="text-muted-foreground">
                  Please wait while our AI agent analyzes your refined diagram structure and
                  generates a comprehensive evaluation report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show the ERD visualization while waiting */}
        {finalData && finalData.entities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Refined Diagram Structure</CardTitle>
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
              {state.selectedLanguage !== "en" && (
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  {getLanguageByCode(state.selectedLanguage).nativeName}
                </span>
              )}
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

                if (!result || !("erdEvaluationStep" in result || "dbEvaluationStep" in result)) {
                  return <p className="text-muted-foreground">Evaluation report not available</p>;
                }

                let evaluationReport = "";

                // Use translated report if available, otherwise use original
                if (translatedReport) {
                  evaluationReport = translatedReport;
                } else {
                  if ("evaluationReport" in result && "extractedInformation" in result) {
                    evaluationReport = (result as { evaluationReport: string }).evaluationReport;
                  } else if ("evaluationReport" in result) {
                    evaluationReport = String(
                      (result as { evaluationReport: string }).evaluationReport,
                    );
                  } else if ("erdEvaluationStep" in result) {
                    evaluationReport = result.erdEvaluationStep?.evaluationReport || "";
                  } else if ("dbEvaluationStep" in result) {
                    evaluationReport = result.dbEvaluationStep?.evaluationReport || "";
                  } else {
                    evaluationReport = "Evaluation report not available";
                  }
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
