import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import WorkflowSteps from "./components/WorkflowSteps.tsx";
import SetupStep from "./components/SetupStep.tsx";
import ExtractDiagramStep from "./components/ExtractDiagramStep.tsx";
import ManualRefineStep from "./components/ManualRefineStep.tsx";
import EvaluationStep from "./components/EvaluationStep.tsx";
import HistorySidebar from "./components/HistorySidebar.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import ErrorDisplay from "./components/ErrorDisplay.tsx";
import { WorkflowProvider, useWorkflow } from "./context/WorkflowContext.tsx";

export type WorkflowStep = "setup" | "extract" | "refine" | "evaluation";

const ERDEvaluationContent = () => {
  const { state, setStep, setError, setLoading } = useWorkflow();
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Helper function to change step and clear loading state
  const handleStepChange = (step: WorkflowStep) => {
    setLoading(false); // Clear any loading state when changing steps
    setStep(step);
  };

  // Show error display if there's a global error
  if (state.error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorDisplay
          title="Workflow Error"
          message={state.error}
          onRetry={() => setError(null)}
          showDetails={true}
          details={state.error}
        />
      </div>
    );
  }

  const renderStepContent = () => {
    const isSyncMode = state.workflowMode === "sync";

    switch (state.currentStep) {
      case "setup":
        return <SetupStep onNext={() => handleStepChange("extract")} />;
      case "extract":
        return (
          <ExtractDiagramStep
            onNext={() => handleStepChange(isSyncMode ? "evaluation" : "refine")}
            onBack={() => handleStepChange("setup")}
          />
        );
      case "refine":
        return (
          <ManualRefineStep
            onNext={() => handleStepChange("evaluation")}
            onBack={() => handleStepChange("extract")}
          />
        );
      case "evaluation":
        return (
          <EvaluationStep onBack={() => handleStepChange(isSyncMode ? "extract" : "refine")} />
        );
      default:
        return <SetupStep onNext={() => handleStepChange("extract")} />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isHistorySidebarOpen ? "mr-80" : ""}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ERD Evaluation</h1>
              <p className="text-muted-foreground">
                Evaluate and analyze Entity Relationship Diagrams through our guided workflow
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              {isHistorySidebarOpen ? "Hide History" : "Show History"}
            </Button>
          </div>

          {/* Workflow Steps - Only show after setup step */}
          {state.currentStep !== "setup" && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkflowSteps currentStep={state.currentStep} onStepClick={handleStepChange} />
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          <div className="min-h-[600px]">{renderStepContent()}</div>
        </div>
      </div>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistorySidebarOpen}
        onToggle={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
      />
    </div>
  );
};

// Main component with provider
const ERDEvaluation = () => {
  return (
    <ErrorBoundary>
      <WorkflowProvider>
        <ERDEvaluationContent />
      </WorkflowProvider>
    </ErrorBoundary>
  );
};

export default ERDEvaluation;
