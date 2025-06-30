import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  met: boolean;
  text: string;
}

const PasswordRequirements = ({ met, text }: PasswordRequirementsProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-gray-400" />}
      <span className={met ? "text-green-600" : "text-gray-600"}>{text}</span>
    </div>
  );
};

export default PasswordRequirements;
