import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, XCircle, AlertCircle, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

interface EvaluationStatusBadgeProps {
  status: string;
  className?: string;
}

const EvaluationStatusBadge = ({ status, className }: EvaluationStatusBadgeProps) => {
  const statusConfig: Record<
    string,
    {
      icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
      label: string;
      className: string;
    }
  > = {
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    },
    running: {
      icon: Loader2,
      label: "Running",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    completed: {
      icon: CheckCircle,
      label: "Completed",
      className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    },
    waiting: {
      icon: AlertCircle,
      label: "Waiting",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1", config.className, className)} variant="outline">
      <Icon className={cn("h-3 w-3", status === "running" && "animate-spin")} />
      {config.label}
    </Badge>
  );
};

export default EvaluationStatusBadge;
