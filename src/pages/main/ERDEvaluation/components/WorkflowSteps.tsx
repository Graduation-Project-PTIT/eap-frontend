import type { FC } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import type { WorkflowStep } from "../index";
import { useWorkflow } from "../context/WorkflowContext";

interface WorkflowStepsProps {
  currentStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
}

const steps = [
  {
    id: "setup" as WorkflowStep,
    name: "Setup",
    description: "Configure evaluation parameters",
  },
  {
    id: "extract" as WorkflowStep,
    name: "Extract Diagram",
    description: "Extract data from ERD",
  },
  {
    id: "refine" as WorkflowStep,
    name: "Manually Refine",
    description: "Refine extracted data",
  },
  {
    id: "evaluation" as WorkflowStep,
    name: "Evaluation",
    description: "Review and analyze results",
  },
];

const WorkflowSteps: FC<WorkflowStepsProps> = ({ currentStep, onStepClick }) => {
  const { state } = useWorkflow();
  const isSyncMode = state.workflowMode === "sync";

  // Filter steps based on workflow mode
  const visibleSteps = isSyncMode ? steps.filter((step) => step.id !== "refine") : steps;

  const getCurrentStepIndex = () => {
    return visibleSteps.findIndex((step) => step.id === currentStep);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between gap-4">
          {visibleSteps.map((step, stepIndex) => {
            const status = getStepStatus(stepIndex);
            const isClickable = stepIndex <= getCurrentStepIndex();

            return (
              <li key={step.id} className="flex-1">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                      {
                        "border-primary bg-primary text-primary-foreground":
                          status === "current" || status === "completed",
                        "border-muted-foreground bg-background text-muted-foreground":
                          status === "upcoming",
                        "cursor-pointer hover:border-primary/80": isClickable,
                      },
                    )}
                  >
                    {status === "completed" ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{stepIndex + 1}</span>
                    )}
                  </button>

                  {/* Step Content */}
                  <div className="ml-4">
                    <button
                      onClick={() => isClickable && onStepClick(step.id)}
                      disabled={!isClickable}
                      className={cn("text-left transition-colors", {
                        "cursor-pointer hover:text-primary": isClickable,
                      })}
                    >
                      <p
                        className={cn("text-sm font-medium", {
                          "text-primary": status === "current",
                          "text-foreground": status === "completed",
                          "text-muted-foreground": status === "upcoming",
                        })}
                      >
                        {step.name}
                      </p>
                    </button>
                  </div>

                  {/* Connector Line */}
                  {stepIndex < visibleSteps.length - 1 && (
                    <div
                      className={cn("h-0.5 w-full flex-1 transition-colors ml-4", {
                        "bg-primary": stepIndex < getCurrentStepIndex(),
                        "bg-muted": stepIndex >= getCurrentStepIndex(),
                      })}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default WorkflowSteps;
