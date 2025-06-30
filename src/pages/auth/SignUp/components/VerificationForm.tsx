import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmSignUp, signUp } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import ROUTES from "@/constants/routes";
import { CheckCircle } from "lucide-react";
import type { SignUpStep } from "../types/sign-up-step";

interface VerificationFormProps {
  email: string;
  password: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onStepChange: (step: SignUpStep) => void;
}

const VerificationForm = ({
  email,
  password,
  verificationCode,
  setVerificationCode,
  onStepChange,
}: VerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      toast.success("Email verified successfully", {
        description: "You can now sign in to your account",
      });

      navigate(ROUTES.AUTH.SIGN_IN);
    } catch (error) {
      console.error("Verification error:", error);

      let errorMessage = "Verification failed";
      if (error instanceof Error) {
        if (error.name === "CodeMismatchException") {
          errorMessage = "Invalid verification code";
        } else if (error.name === "ExpiredCodeException") {
          errorMessage = "Verification code has expired";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      toast.success("Verification code resent", {
        description: "Please check your email",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>We've sent a verification code to {email}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn't receive the code? </span>
            <button
              onClick={resendVerificationCode}
              className="text-primary hover:underline font-medium"
            >
              Resend
            </button>
          </div>

          <div className="text-center text-sm">
            <button
              onClick={() => onStepChange("SIGN_UP")}
              className="text-primary hover:underline font-medium"
            >
              ← Back to sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationForm;
