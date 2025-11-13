import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, FileImage, Calendar } from "lucide-react";
import { type EvaluationRecord } from "@/api/services/evaluation-service";
import { fileServiceClient } from "@/api/client";
import EvaluationStatusBadge from "./EvaluationStatusBadge";
import { cn } from "@/lib/utils";

interface EvaluationHistoryCardProps {
  evaluation: EvaluationRecord;
  onViewDetails: (evaluation: EvaluationRecord) => void;
}

const EvaluationHistoryCard = ({ evaluation, onViewDetails }: EvaluationHistoryCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  // Fetch image with authentication
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Extract file ID from erdImageUrl
        const url = new URL(evaluation.erdImageUrl);
        const pathParts = url.pathname.split("/");
        const fileId = pathParts[pathParts.length - 2]; // Extract from /files/{fileId}/render

        if (!fileId) {
          throw new Error("Invalid file URL");
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

    // Cleanup blob URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [evaluation.erdImageUrl]);

  const statusConfig: Record<string, { bgColor: string }> = {
    pending: { bgColor: "bg-yellow-50 dark:bg-yellow-950" },
    running: { bgColor: "bg-blue-50 dark:bg-blue-950" },
    completed: { bgColor: "bg-green-50 dark:bg-green-950" },
    failed: { bgColor: "bg-red-50 dark:bg-red-950" },
    waiting: { bgColor: "bg-orange-50 dark:bg-orange-950" },
  };

  const config = statusConfig[evaluation.status] || statusConfig.pending;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-0">
        {/* Image Preview */}
        <div className={cn("relative h-32", config.bgColor, "flex items-center justify-center")}>
          {imageLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : imageError ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <FileImage className="h-8 w-8 mb-1" />
              <span className="text-xs">Preview unavailable</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="ERD Preview"
              className="h-full w-full object-contain"
              onError={() => setImageError(true)}
            />
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">
            <EvaluationStatusBadge status={evaluation.status} />
          </div>
        </div>

        {/* Evaluation Info */}
        <div className="p-3 space-y-2">
          <div>
            <p
              className="text-sm font-medium line-clamp-2 min-h-[2.5rem]"
              title={evaluation.questionDescription}
            >
              {evaluation.questionDescription}
            </p>
            {evaluation.status === "completed" && evaluation.score !== null && (
              <p className="text-xl font-bold text-primary mt-1">
                {evaluation.score}
                <span className="text-xs text-muted-foreground font-normal"> / 100</span>
              </p>
            )}
            {evaluation.status === "failed" && (
              <p className="text-xs text-destructive mt-1">Evaluation failed</p>
            )}
            {evaluation.status === "running" && (
              <p className="text-xs text-muted-foreground mt-1">Evaluation in progress...</p>
            )}
            {evaluation.status === "pending" && (
              <p className="text-xs text-muted-foreground mt-1">Waiting to start...</p>
            )}
            {evaluation.status === "waiting" && (
              <p className="text-xs text-muted-foreground mt-1">Waiting for input...</p>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(evaluation.createdAt)}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {evaluation.status === "completed" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={() => onViewDetails(evaluation)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            )}
            {(evaluation.status === "running" || evaluation.status === "waiting") && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={() => onViewDetails(evaluation)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Progress
              </Button>
            )}
            {(evaluation.status === "pending" || evaluation.status === "failed") && (
              <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled>
                <Loader2 className="h-3 w-3 mr-1" />
                {evaluation.status === "pending" ? "Pending" : "Failed"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationHistoryCard;
