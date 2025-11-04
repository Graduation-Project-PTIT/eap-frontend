import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, XCircle, Ban } from "lucide-react";

interface BatchStatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  showIcon?: boolean;
  className?: string;
}

const BatchStatusBadge = ({ status, showIcon = true, className }: BatchStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    processing: {
      label: "Processing",
      variant: "default" as const,
      icon: Loader2,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    completed: {
      label: "Completed",
      variant: "default" as const,
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    failed: {
      label: "Failed",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    cancelled: {
      label: "Cancelled",
      variant: "secondary" as const,
      icon: Ban,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ""}`}>
      {showIcon && (
        <Icon className={`mr-1 h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      )}
      {config.label}
    </Badge>
  );
};

export default BatchStatusBadge;
