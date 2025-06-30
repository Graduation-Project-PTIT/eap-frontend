import getPasswordRequirements from "../utils/getPasswordRequirements";
import PasswordRequirementItem from "./PasswordRequirementItem";

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Password Requirements:
      </div>
      <div className="space-y-1">
        <PasswordRequirementItem met={requirements.minLength} text="At least 8 characters" />
        <PasswordRequirementItem met={requirements.hasLowercase} text="Contains lowercase letter" />
        <PasswordRequirementItem met={requirements.hasUppercase} text="Contains uppercase letter" />
        <PasswordRequirementItem met={requirements.hasNumber} text="Contains number" />
        <PasswordRequirementItem
          met={requirements.hasSpecialChar}
          text="Contains special character"
        />
      </div>
    </div>
  );
};

export default PasswordRequirements;
