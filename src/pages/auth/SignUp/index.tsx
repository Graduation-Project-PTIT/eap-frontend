import { useState } from "react";
import SignUpForm from "./components/SignUpForm";
import VerificationForm from "./components/VerificationForm";
import type { SignUpStep } from "./types/sign-up-step";

const SignUp = () => {
  const [step, setStep] = useState<SignUpStep>("SIGN_UP");
  const [email, setEmail] = useState("");

  const handleStepChange = (newStep: SignUpStep, userEmail?: string) => {
    setStep(newStep);
    if (userEmail) {
      setEmail(userEmail);
    }
  };

  if (step === "CONFIRM_SIGN_UP") {
    return <VerificationForm email={email} onStepChange={handleStepChange} />;
  }

  return <SignUpForm onStepChange={handleStepChange} />;
};

export default SignUp;
