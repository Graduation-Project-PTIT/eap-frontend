import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <Bot className="h-5 w-5 text-primary-foreground" />
      </div>

      <Card className="p-4 bg-muted">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">AI is thinking</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;
