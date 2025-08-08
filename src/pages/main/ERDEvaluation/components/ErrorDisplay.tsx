import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  showDetails?: boolean;
  details?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Error",
  message,
  onRetry,
  onBack,
  showDetails = false,
  details,
}) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{message}</p>

        {showDetails && details && (
          <details className="bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 text-sm overflow-auto whitespace-pre-wrap">{details}</pre>
          </details>
        )}

        <div className="flex space-x-2">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
