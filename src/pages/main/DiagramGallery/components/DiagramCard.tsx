import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Eye, Calendar } from "lucide-react";
import type { DiagramResponse } from "@/api/services/diagram-service";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface DiagramCardProps {
  diagram: DiagramResponse;
}

const DiagramCard = ({ diagram }: DiagramCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/diagrams/${diagram.id}`);
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "private":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
      case "class":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{diagram.title}</h3>
          <Badge className={getVisibilityColor(diagram.visibility)} variant="secondary">
            {diagram.visibility}
          </Badge>
        </div>
        {diagram.domain && (
          <Badge variant="outline" className="w-fit mt-2">
            {diagram.domain}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        {diagram.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{diagram.description}</p>
        )}
        {diagram.author && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <span>by {diagram.author.username}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{diagram.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{diagram.upvoteCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{diagram.downvoteCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(diagram.createdAt), { addSuffix: true })}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiagramCard;
