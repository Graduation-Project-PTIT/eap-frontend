import { useState } from "react";
import SignUpForm from "./components/SignUpForm";
import VerificationForm from "./components/VerificationForm";
import type { SignUpStep } from "./types/sign-up-step";

const SignUp = () => {
  const [step, setStep] = useState<SignUpStep>("SIGN_UP");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  if (step === "CONFIRM_SIGN_UP") {
    return (
      <VerificationForm
        email={email}
        password={password}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        onStepChange={setStep}
      />
    );
  }

  return (
    <SignUpForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      onStepChange={setStep}
    />
  );
};

export default SignUp;
