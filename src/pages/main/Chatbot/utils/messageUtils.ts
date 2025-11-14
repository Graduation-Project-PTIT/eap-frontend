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
    ddl: response.ddl,
    runId: response.runId,
  };
};

// Check if a message has schema data
export const hasSchema = (message: ChatMessage): boolean => {
  return !!message.schema && message.schema.entities.length > 0;
};
