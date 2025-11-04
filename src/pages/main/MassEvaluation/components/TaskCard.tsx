import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type MassEvaluationTask } from "@/api/services/mass-evaluation-service";
import { CheckCircle, Clock, Loader2, XCircle, Eye, RotateCw, FileImage } from "lucide-react";
import { useFileRenderUrl } from "@/api/services/file-service";

interface TaskCardProps {
  task: MassEvaluationTask;
  onView: (task: MassEvaluationTask) => void;
  onRetry?: (task: MassEvaluationTask) => void;
}

const TaskCard = ({ task, onView, onRetry }: TaskCardProps) => {
  const fileRenderUrl = useFileRenderUrl(task.fileKey);

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      label: "Pending",
    },
    processing: {
      icon: Loader2,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      label: "Processing",
    },
    completed: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      label: "Completed",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      label: "Failed",
    },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Image Preview */}
        <div className={`relative h-40 ${config.bgColor} flex items-center justify-center`}>
          {task.fileKey ? (
            <img
              src={fileRenderUrl}
              alt={task.fileKey}
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="flex flex-col items-center justify-center text-muted-foreground">
                    <svg class="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Image preview unavailable</span>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <FileImage className="h-12 w-12 mb-2" />
              <span className="text-sm">No preview</span>
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border border-current`}
            >
              <StatusIcon
                className={`h-3 w-3 ${task.status === "processing" ? "animate-spin" : ""}`}
              />
              {config.label}
            </div>
          </div>
        </div>

        {/* Task Info */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm font-medium truncate" title={task.fileKey}>
              {task.fileKey}
            </p>
            {task.status === "completed" && task.score !== null && (
              <p className="text-2xl font-bold text-primary mt-1">
                {task.score}
                <span className="text-sm text-muted-foreground font-normal"> / 100</span>
              </p>
            )}
            {task.status === "failed" && task.errorMessage && (
              <p className="text-xs text-destructive mt-1 line-clamp-2" title={task.errorMessage}>
                {task.errorMessage}
              </p>
            )}
            {task.status === "processing" && (
              <p className="text-xs text-muted-foreground mt-1">Evaluation in progress...</p>
            )}
            {task.status === "pending" && (
              <p className="text-xs text-muted-foreground mt-1">Waiting to start...</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {task.status === "completed" && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(task)}>
                <Eye className="h-4 w-4 mr-1" />
                View Report
              </Button>
            )}
            {task.status === "failed" && onRetry && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onRetry(task)}>
                <RotateCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            {(task.status === "processing" || task.status === "pending") && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                In Progress
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
