import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type MassEvaluationTask } from "@/api/services/mass-evaluation-service";
import { fileServiceClient } from "@/api/client";
import { Download, FileImage, Loader2, Clock } from "lucide-react";
import BatchStatusBadge from "./BatchStatusBadge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface TaskDetailDialogProps {
  task: MassEvaluationTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailDialog = ({ task, open, onOpenChange }: TaskDetailDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Fetch image with authentication when dialog opens
  useEffect(() => {
    if (!task || !open) {
      return;
    }

    const fetchImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Fetch image with authentication
        const response = await fileServiceClient.get(`/${task.fileKey}/render`, {
          responseType: "blob",
        });

        // Create blob URL
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL when dialog closes
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [task, open]);

  if (!task) return null;

  const handleDownloadReport = () => {
    if (!task.evaluationReport) return;

    const blob = new Blob([task.evaluationReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-report-${task.fileKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[92vw] !w-[92vw] !h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">Task Details - {task.fileKey}</span>
            <div className="flex items-center gap-3 shrink-0">
              <BatchStatusBadge status={task.status} />
              {task.status === "completed" && task.score !== null && (
                <span className="text-lg font-bold text-primary">Score: {task.score} / 100</span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-6 p-4 py-0 flex-1 overflow-hidden">
          {/* Left Side - Image Preview (2/5) */}
          <div className="flex flex-col overflow-hidden col-span-2">
            <h3 className="text-sm font-semibold mb-3 shrink-0">ERD Diagram</h3>
            <div className="flex-1 border rounded-lg overflow-auto bg-muted/30 flex items-center justify-center min-h-0">
              {imageLoading ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-16 w-16 mb-4 animate-spin" />
                  <p className="text-sm">Loading image...</p>
                </div>
              ) : imageError ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FileImage className="h-16 w-16 mb-4" />
                  <p className="text-sm">Image preview unavailable</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={task.fileKey}
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FileImage className="h-16 w-16 mb-4" />
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Evaluation Report or Error (3/5) */}
          <div className="flex flex-col overflow-hidden col-span-3">
            <h3 className="text-sm font-semibold mb-3 shrink-0">
              {task.status === "completed"
                ? "Evaluation Report"
                : task.status === "failed"
                  ? "Error Details"
                  : "Status"}
            </h3>
            <div className="flex-1 border rounded-lg bg-muted/30 overflow-auto min-h-0">
              <div className="p-6">
                {task.status === "completed" && task.evaluationReport ? (
                  <div className="prose prose-gray max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
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
                        hr: () => <hr className="my-6 border-t border-border" />,
                        ul: ({ children }) => (
                          <ul className="list-disc mb-4 space-y-2 pl-6">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal mb-4 space-y-2 pl-6">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                            {children}
                          </pre>
                        ),
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {task.evaluationReport}
                    </ReactMarkdown>
                  </div>
                ) : task.status === "failed" && task.errorMessage ? (
                  <div className="space-y-4">
                    <div className="border border-destructive rounded-lg p-4 bg-destructive/5">
                      <p className="text-sm text-destructive whitespace-pre-wrap">
                        {task.errorMessage}
                      </p>
                    </div>
                    {task.retryCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Retry attempts: {task.retryCount}
                      </p>
                    )}
                    {task.workflowRunId && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Workflow Run ID:</p>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {task.workflowRunId}
                        </code>
                      </div>
                    )}
                  </div>
                ) : task.status === "processing" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-16 w-16 mb-4 animate-spin" />
                    <p className="text-sm">Task is being processed...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clock className="h-16 w-16 mb-4" />
                    <p className="text-sm">Task is pending...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              Task ID: <code className="font-mono text-xs">{task.id}</code>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {task.status === "completed" && task.evaluationReport && (
                <Button onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
