import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useDeleteFeedback } from "@/api/services/diagram-service";
import type { DiagramFeedback } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";
import FeedbackForm from "./FeedbackForm";

interface FeedbackItemProps {
  feedback: DiagramFeedback;
}

const FeedbackItem = ({ feedback }: FeedbackItemProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useDeleteFeedback();

  // Get current user
  useMemo(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const isAuthor = currentUserId && feedback.teacherId === currentUserId;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ feedbackId: feedback.id, diagramId: feedback.diagramId });
      toast.success("Feedback deleted");
    } catch {
      toast.error("Failed to delete feedback");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getFeedbackTypeBadge = (type: "suggestion" | "review" | "compliment") => {
    if (type === "suggestion") {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
          <MessageSquare className="h-3 w-3 mr-1" />
          Suggestion
        </Badge>
      );
    }
    if (type === "review") {
      return (
        <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
          <MessageSquare className="h-3 w-3 mr-1" />
          Review
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
        <MessageSquare className="h-3 w-3 mr-1" />
        Compliment
      </Badge>
    );
  };

  if (isEditing) {
    return (
      <div className="pt-4 pb-2 pl-14">
        <FeedbackForm
          diagramId={feedback.diagramId}
          feedback={feedback}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {feedback.teacher
              ? getInitials(feedback.teacher.fullName || feedback.teacher.username)
              : "T"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {feedback.teacher?.fullName || feedback.teacher?.username || "Teacher"}
              </span>
              {getFeedbackTypeBadge(feedback.feedbackType)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Actions (author only) */}
            {isAuthor && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Feedback Content */}
          <div className="text-sm whitespace-pre-wrap break-words">{feedback.content}</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FeedbackItem;
