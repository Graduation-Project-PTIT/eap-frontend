import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useVoteDiagram, useRemoveVote } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  diagramId: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: "upvote" | "downvote";
  isOwner: boolean;
}

const VoteButtons = ({
  diagramId,
  upvoteCount,
  downvoteCount,
  userVote,
  isOwner,
}: VoteButtonsProps) => {
  const voteMutation = useVoteDiagram();
  const removeVoteMutation = useRemoveVote();

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (isOwner) {
      toast.error("You cannot vote on your own diagram");
      return;
    }

    try {
      if (userVote === voteType) {
        // Remove vote if clicking the same button
        await removeVoteMutation.mutateAsync(diagramId);
        toast.success("Vote removed");
      } else {
        // Add or change vote
        await voteMutation.mutateAsync({ id: diagramId, voteType });
        toast.success(`${voteType === "upvote" ? "Upvoted" : "Downvoted"} successfully`);
      }
    } catch {
      toast.error("Failed to vote. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === "upvote" ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote("upvote")}
        disabled={voteMutation.isPending || removeVoteMutation.isPending || isOwner}
        className={cn("gap-2", userVote === "upvote" && "bg-green-500 hover:bg-green-600")}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvoteCount}</span>
      </Button>
      <Button
        variant={userVote === "downvote" ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote("downvote")}
        disabled={voteMutation.isPending || removeVoteMutation.isPending || isOwner}
        className={cn("gap-2", userVote === "downvote" && "bg-red-500 hover:bg-red-600")}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downvoteCount}</span>
      </Button>
    </div>
  );
};

export default VoteButtons;
