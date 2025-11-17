import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type EvaluationRecord } from "@/api/services/evaluation-service";
import { fileServiceClient } from "@/api/client";
import { Download, FileImage, Loader2, Eye, FileText, Calendar, Clock } from "lucide-react";
import EvaluationStatusBadge from "./EvaluationStatusBadge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import ERDFormatTabs from "@/components/erd/ERDFormatTabs";

interface EvaluationDetailDialogProps {
  evaluation: EvaluationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EvaluationDetailDialog = ({
  evaluation,
  open,
  onOpenChange,
}: EvaluationDetailDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showRawMarkdown, setShowRawMarkdown] = useState<boolean>(false);

  // Fetch image with authentication when dialog opens
  useEffect(() => {
    if (!evaluation || !open) {
      return;
    }

    const fetchImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Use fileKey directly
        const fileId = evaluation.fileKey;

        if (!fileId) {
          throw new Error("Missing file key");
        }

        // Fetch image with authentication
        const response = await fileServiceClient.get(`/${fileId}/render`, {
          responseType: "blob",
        });

        // Create blob URL
        const blobUrl = URL.createObjectURL(response.data);
        setImageUrl(blobUrl);
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
  }, [evaluation?.fileKey, open]);

  if (!evaluation) return null;

  const handleDownloadReport = () => {
    if (!evaluation.evaluationReport) return;

    const blob = new Blob([evaluation.evaluationReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-report-${evaluation.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[92vw] !w-[92vw] !h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate mr-4">Evaluation Details</span>
            <div className="flex items-center gap-3 shrink-0">
              <EvaluationStatusBadge status={evaluation.status} />
              {evaluation.status === "completed" && evaluation.score !== null && (
                <span className="text-lg font-bold text-primary">
                  Score: {evaluation.score} / 100
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 p-6 flex-1 overflow-hidden">
          {/* Left Side - Image Preview & Info (40%) */}
          <div className="flex flex-col overflow-hidden w-[40%] space-y-4">
            {/* ERD Diagram - 70% */}
            <div className="flex flex-col overflow-hidden h-[70%]">
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
                ) : (
                  <img
                    src={imageUrl}
                    alt="ERD Diagram"
                    className="max-w-full max-h-full object-contain p-4"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>

            {/* Evaluation Information - 30% */}
            <Card className="h-[30%] overflow-hidden flex flex-col">
              <CardHeader className="mb-0">
                <CardTitle className="text-base">Evaluation Information</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Question Description</p>
                    <p className="text-sm">{evaluation.questionDescription}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Workflow Mode</p>
                    <Badge variant="outline">{evaluation.workflowMode}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(evaluation.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {formatDate(evaluation.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Evaluation Report (60%) */}
          <div className="flex flex-col overflow-hidden w-[60%] space-y-4">
            {/* Evaluation Report */}
            {evaluation.evaluationReport && (
              <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                <CardHeader className="pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Evaluation Report</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="markdown-toggle"
                          className="text-xs font-medium flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Rendered
                        </Label>
                        <Switch
                          id="markdown-toggle"
                          checked={showRawMarkdown}
                          onCheckedChange={setShowRawMarkdown}
                        />
                        <Label
                          htmlFor="markdown-toggle"
                          className="text-xs font-medium flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Raw
                        </Label>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleDownloadReport}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto min-h-0">
                  {showRawMarkdown ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {evaluation.evaluationReport}
                    </pre>
                  ) : (
                    <div className="prose prose-sm prose-gray max-w-none dark:prose-invert">
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
                        {evaluation.evaluationReport}
                      </ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Extracted Information */}
            {evaluation.extractedInformation && (
              <Card className="shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Extracted ERD Information</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-auto">
                  <ERDFormatTabs data={evaluation.extractedInformation} isEditable={false} />
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {evaluation.status === "running" && (
              <Card className="shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Evaluation in progress...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {evaluation.status === "failed" && (
              <Card className="shrink-0 border-destructive">
                <CardContent className="p-4">
                  <div className="text-sm text-destructive">
                    <p className="font-semibold mb-1">Evaluation Failed</p>
                    <p className="text-xs">
                      This evaluation encountered an error and could not be completed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDetailDialog;
