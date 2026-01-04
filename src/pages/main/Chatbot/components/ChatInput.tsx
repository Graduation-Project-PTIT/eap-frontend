import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
  enableSearch?: boolean;
  onEnableSearchChange?: (enabled: boolean) => void;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = "Type your message...",
  className,
  enableSearch = true,
  onEnableSearchChange,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Web Search Toggle */}
      {onEnableSearchChange && (
        <div className="flex items-center gap-2 px-1">
          <Switch
            id="enable-search"
            checked={enableSearch}
            onCheckedChange={onEnableSearchChange}
            disabled={isLoading}
          />
          <Label htmlFor="enable-search" className="flex items-center gap-2 text-sm cursor-pointer">
            <Globe className="h-4 w-4" />
            <span>Enable web search</span>
          </Label>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="h-[60px] max-h-[200px] resize-none"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="h-[60px] w-[60px] shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
