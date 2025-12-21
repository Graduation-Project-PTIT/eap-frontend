import type { ChatMessage, ChatResponse } from "@/api/services/chat-service";

// Create a user message object
export const createUserMessage = (content: string): ChatMessage => {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    timestamp: new Date(),
  };
};

// Create an assistant message object from API response
export const createAssistantMessage = (response: ChatResponse): ChatMessage => {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response.response,
    timestamp: new Date(),
    schema: response.schema,
    erdSchema: response.erdSchema || undefined,
    ddl: response.ddl,
    runId: response.runId,
    diagramType: response.diagramType,
  };
};

// Check if a message has schema data (Physical DB or ERD)
export const hasSchema = (message: ChatMessage): boolean => {
  const hasPhysicalSchema = !!message.schema && message.schema.entities.length > 0;
  const hasErdSchema = !!message.erdSchema && message.erdSchema.entities.length > 0;
  return hasPhysicalSchema || hasErdSchema;
};
