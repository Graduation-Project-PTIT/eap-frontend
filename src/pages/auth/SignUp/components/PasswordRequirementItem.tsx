import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  met: boolean;
  text: string;
}

const PasswordRequirements = ({ met, text }: PasswordRequirementsProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
      )}
      <span
        className={met ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-300"}
      >
        {text}
      </span>
    </div>
  );
};

export default PasswordRequirements;
