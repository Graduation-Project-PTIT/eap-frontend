import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export function ToastDemo() {
  const handleSuccessToast = () => {
    toast.success("Operation completed successfully!");
  };

  const handleErrorToast = () => {
    toast.error("Something went wrong", {
      description: "Please try again later or contact support.",
    });
  };

  const handleWarningToast = () => {
    toast.warning("This action cannot be undone", {
      description: "Make sure you want to proceed.",
    });
  };

  const handleInfoToast = () => {
    toast.info("New feature available", {
      description: "Check out the new ERD templates in the designer.",
    });
  };

  const handleLoadingToast = () => {
    const loadingToast = toast.loading("Processing your request...");

    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Request processed successfully!");
    }, 3000);
  };

  const handlePromiseToast = () => {
    const mockAsyncOperation = new Promise((resolve, reject) => {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
      }, 2000);
    });

    toast.promise(mockAsyncOperation, {
      loading: "Saving your changes...",
      success: "Changes saved successfully!",
      error: "Failed to save changes",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Toast Notifications Demo</CardTitle>
        <CardDescription>
          Test different types of toast notifications. All toasts appear at the top-center of the
          page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleSuccessToast} variant="default">
            Success Toast
          </Button>

          <Button onClick={handleErrorToast} variant="destructive">
            Error Toast
          </Button>

          <Button onClick={handleWarningToast} variant="outline">
            Warning Toast
          </Button>

          <Button onClick={handleInfoToast} variant="secondary">
            Info Toast
          </Button>

          <Button onClick={handleLoadingToast} variant="outline">
            Loading Toast
          </Button>

          <Button onClick={handlePromiseToast} variant="outline">
            Promise Toast
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Usage Examples:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <code>toast.success("Message")</code>
            </p>
            <p>
              <code>toast.error("Error", &#123; description: "Details" &#125;)</code>
            </p>
            <p>
              <code>toast.loading("Processing...")</code>
            </p>
            <p>
              <code>toast.promise(promise, &#123; loading, success, error &#125;)</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
