import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useAddFeedback, useUpdateFeedback } from "@/api/services/diagram-service";
import type { DiagramFeedback, DiagramFeedbackInput } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";
import { Separator } from "@/components/ui/separator";
import { MessageSquarePlus } from "lucide-react";

interface FeedbackFormProps {
  diagramId: string;
  feedback?: DiagramFeedback; // For edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FeedbackForm = ({ diagramId, feedback, onSuccess, onCancel }: FeedbackFormProps) => {
  const [content, setContent] = useState(feedback?.content || "");
  const [feedbackType, setFeedbackType] = useState<"suggestion" | "review" | "compliment">(
    feedback?.feedbackType || "suggestion",
  );

  const addMutation = useAddFeedback();
  const updateMutation = useUpdateFeedback();

  const isEditing = !!feedback;
  const mutation = isEditing ? updateMutation : addMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter feedback content");
      return;
    }

    const data: DiagramFeedbackInput = {
      content: content.trim(),
      feedbackType,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          feedbackId: feedback.id,
          data,
          diagramId: feedback.diagramId,
        });
        toast.success("Feedback updated");
      } else {
        await addMutation.mutateAsync({
          diagramId,
          data,
        });
        toast.success("Feedback added");
        setContent("");
        setFeedbackType("suggestion");
      }
      onSuccess?.();
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "add"} feedback`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && <Separator />}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">
            {isEditing ? "Edit Feedback" : "Add Feedback"}
          </Label>
        </div>

        <Textarea
          placeholder="Share your thoughts, suggestions, or review..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Feedback Type</Label>
        <RadioGroup
          value={feedbackType}
          onValueChange={(value) =>
            setFeedbackType(value as "suggestion" | "review" | "compliment")
          }
          disabled={mutation.isPending}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="suggestion" id="suggestion" />
            <Label htmlFor="suggestion" className="font-normal cursor-pointer">
              Suggestion
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="review" id="review" />
            <Label htmlFor="review" className="font-normal cursor-pointer">
              Review
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compliment" id="compliment" />
            <Label htmlFor="compliment" className="font-normal cursor-pointer">
              Compliment
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Add Feedback"}
        </Button>
        {isEditing && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default FeedbackForm;
