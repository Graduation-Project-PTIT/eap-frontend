import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import ROUTES from "@/constants/routes";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Callback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if user is authenticated after OAuth callback
        const user = await getCurrentUser();

        if (user) {
          setStatus("success");
          toast.success("Sign in successful", {
            description: "Welcome to ERD AI Platform!",
          });

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD);
          }, 2000);
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed");

        toast.error("Authentication failed", {
          description: "Please try signing in again",
        });

        // Redirect to sign in page after a short delay
        setTimeout(() => {
          navigate(ROUTES.AUTH.SIGN_IN);
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "loading":
        return {
          title: "Completing sign in...",
          description: "Please wait while we authenticate your account",
        };
      case "success":
        return {
          title: "Sign in successful!",
          description: "Redirecting you to the dashboard...",
        };
      case "error":
        return {
          title: "Authentication failed",
          description: errorMessage || "Something went wrong. Redirecting to sign in...",
        };
      default:
        return {
          title: "Processing...",
          description: "Please wait",
        };
    }
  };

  const { title, description } = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">This may take a few moments...</p>
            </div>
          )}

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              You will be redirected automatically in a few seconds.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to the sign in page shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Callback;
