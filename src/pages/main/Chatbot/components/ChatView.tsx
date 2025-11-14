import { useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessage } from "@/api/services/chat-service";

interface ChatViewProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSchemaClick: () => void;
}

const ChatView = ({
  messages,
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  error,
  onRetry,
  onSchemaClick,
}: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-300">
      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onSchemaClick={
              message.schema && message.schema.entities.length > 0 ? onSchemaClick : undefined
            }
          />
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box - Fixed at Bottom */}
      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSend={onSend}
            isLoading={isLoading}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
};

export default ChatView;
