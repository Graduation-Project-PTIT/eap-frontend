import { Card } from "@/components/ui/card";
import { Database, Sparkles } from "lucide-react";
import ChatInput from "./ChatInput";

interface WelcomeViewProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onSuggestedPromptClick: (prompt: string) => void;
  enableSearch?: boolean;
  onEnableSearchChange?: (enabled: boolean) => void;
}

const SUGGESTED_PROMPTS = [
  "Design an ERD for an e-commerce platform",
  "Create an ERD for a social media application",
  "Design a database schema for a library management system",
  "Design tables for a hospital management system",
];

const WelcomeView = ({
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  onSuggestedPromptClick,
  enableSearch,
  onEnableSearchChange,
}: WelcomeViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Database className="h-16 w-16 text-primary" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          ERD Design Assistant
        </h1>

        <p className="text-lg text-muted-foreground">
          Describe your requirements in natural language, and I'll help you design a complete ERD
          with entities and relationships. You can then convert your ERD to database schema with DDL
          scripts.
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="w-full max-w-3xl mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
          Try these examples:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:bg-accent hover:shadow-md transition-all duration-200 border-2 hover:border-primary"
              onClick={() => onSuggestedPromptClick(prompt)}
            >
              <p className="text-sm">{prompt}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="w-full max-w-3xl">
        <ChatInput
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          isLoading={isLoading}
          placeholder="Describe your ERD requirements or ask to convert ERD to database schema..."
          className="shadow-lg"
          enableSearch={enableSearch}
          onEnableSearchChange={onEnableSearchChange}
        />
      </div>
    </div>
  );
};

export default WelcomeView;
