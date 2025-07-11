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

export type WorkflowStep = "setup" | "extract" | "refine" | "evaluation";

const ERDEvaluation = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("setup");
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  const renderStepContent = () => {
    switch (currentStep) {
      case "setup":
        return <SetupStep onNext={() => setCurrentStep("extract")} />;
      case "extract":
        return (
          <ExtractDiagramStep
            onNext={() => setCurrentStep("refine")}
            onBack={() => setCurrentStep("setup")}
          />
        );
      case "refine":
        return (
          <ManualRefineStep
            onNext={() => setCurrentStep("evaluation")}
            onBack={() => setCurrentStep("extract")}
          />
        );
      case "evaluation":
        return <EvaluationStep onBack={() => setCurrentStep("refine")} />;
      default:
        return <SetupStep onNext={() => setCurrentStep("extract")} />;
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

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowSteps currentStep={currentStep} onStepClick={setCurrentStep} />
            </CardContent>
          </Card>

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

export default ERDEvaluation;
