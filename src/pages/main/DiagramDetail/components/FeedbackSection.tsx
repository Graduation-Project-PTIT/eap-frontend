import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { useFeedbacks } from "@/api/services/diagram-service";
import usePermissions from "@/hooks/use-permissions";
import FeedbackList from "./FeedbackList";
import FeedbackForm from "./FeedbackForm";

interface FeedbackSectionProps {
  diagramId: string;
}

const FeedbackSection = ({ diagramId }: FeedbackSectionProps) => {
  const { data: feedbacks, isLoading } = useFeedbacks(diagramId);
  const { isTeacher } = usePermissions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Feedback</CardTitle>
            {feedbacks && feedbacks.length > 0 && (
              <Badge variant="secondary">{feedbacks.length}</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isTeacher()
            ? "Review this diagram and provide suggestions or feedback"
            : "Feedback from teachers"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Feedback List */}
        {!isLoading && feedbacks && feedbacks.length > 0 && <FeedbackList feedbacks={feedbacks} />}

        {/* Empty State */}
        {!isLoading && feedbacks && feedbacks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No feedback yet.</p>
            {isTeacher() && <p className="text-xs mt-1">Be the first to add feedback!</p>}
          </div>
        )}

        {/* Add Feedback Form (Teachers Only) */}
        {isTeacher() && <FeedbackForm diagramId={diagramId} />}
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;
