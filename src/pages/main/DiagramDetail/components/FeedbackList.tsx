import { Separator } from "@/components/ui/separator";
import type { DiagramFeedback } from "@/api/services/diagram-service";
import FeedbackItem from "./FeedbackItem";

interface FeedbackListProps {
  feedbacks: DiagramFeedback[];
}

const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  return (
    <div className="space-y-4">
      {feedbacks.map((feedback, index) => (
        <div key={feedback.id}>
          <FeedbackItem feedback={feedback} />
          {index < feedbacks.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;
