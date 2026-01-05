import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/api/services/chat-service";
import MarkdownRender from "@/components/ui/markdown-render";

interface MessageBubbleProps {
  message: ChatMessage;
  onSchemaClick?: (tabToOpen?: string) => void;
}

const MessageBubble = ({ message, onSchemaClick }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  // Check for both Physical DB schema and ERD schema
  const hasPhysicalSchema = !!message.schema && message.schema.entities.length > 0;
  const hasErdSchema = !!message.erdSchema && message.erdSchema.entities.length > 0;
  const hasSchema = hasPhysicalSchema || hasErdSchema;

  // Determine which tab to open based on diagram type
  const getTabToOpen = () => {
    console.log("🔍 MessageBubble getTabToOpen - Message data:", {
      diagramType: message.diagramType,
      hasPhysical: hasPhysicalSchema,
      hasErd: hasErdSchema,
      schemaEntities: message.schema?.entities?.length || 0,
      erdSchemaEntities: message.erdSchema?.entities?.length || 0,
      erdSchemaType: typeof message.erdSchema,
      erdSchemaKeys: message.erdSchema ? Object.keys(message.erdSchema) : [],
    });

    // First priority: use the diagram type from message
    if (message.diagramType === "ERD") return "erd";
    if (message.diagramType === "PHYSICAL_DB") return "physical";

    // Fallback: if only one type exists, use that
    if (hasErdSchema && !hasPhysicalSchema) return "erd";
    if (hasPhysicalSchema && !hasErdSchema) return "physical";

    // If both exist, prefer physical (conversion case)
    if (hasPhysicalSchema) return "physical";

    // Default to erd as last resort
    return "erd";
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isUser && "items-end")}>
        <Card
          className={cn(
            "p-4 overflow-hidden",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <div className="overflow-x-auto max-w-full">
            <MarkdownRender content={message.content} />
          </div>
        </Card>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>

          {hasSchema && onSchemaClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSchemaClick(getTabToOpen())}
              className="h-6 px-2 text-xs"
            >
              <Database className="h-3 w-3 mr-1" />
              View Schema
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
