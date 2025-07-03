import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmSignUp } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/lib/toast";
import ROUTES from "@/constants/routes";
import { CheckCircle } from "lucide-react";
import { verificationSchema, type VerificationFormData } from "@/lib/validations/auth";
import type { SignUpStep } from "../types/sign-up-step";

interface VerificationFormProps {
  email: string;
  onStepChange: (step: SignUpStep, email?: string) => void;
}

const VerificationForm = ({ email, onStepChange }: VerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const handleVerification = async (data: VerificationFormData) => {
    setIsLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: data.verificationCode,
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
      // Note: AWS Amplify doesn't have a direct resend confirmation code API
      // This would typically require calling the backend or using AWS SDK directly
      toast.info("Resend functionality", {
        description: "Please contact support to resend verification code",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerification)} className="space-y-4">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Check your email for the verification code
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </Form>

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
