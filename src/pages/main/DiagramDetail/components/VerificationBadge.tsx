import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DiagramResponse } from "@/api/services/diagram-service";

interface VerificationBadgeProps {
  diagram: DiagramResponse;
}

const VerificationBadge = ({ diagram }: VerificationBadgeProps) => {
  if (!diagram.isVerified) return null;

  const verifiedDate = diagram.verifiedAt
    ? formatDistanceToNow(new Date(diagram.verifiedAt), { addSuffix: true })
    : "recently";

  const verifierName = diagram.verifierInfo?.username || "a teacher";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="ml-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Verified by <span className="font-semibold">{verifierName}</span> {verifiedDate}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
