import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, DiagramType, ERDSchema } from "@/api/services/chat-service";
import type { DBEntity } from "@/api";

interface ConversationData {
  exists: boolean;
  messages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    schema?: { entities: DBEntity[] };
    erdSchema?: ERDSchema;
    ddl?: string;
    runId?: string;
    diagramType?: DiagramType;
  }>;
}

/**
 * Custom hook for managing chat messages
 * Handles loading messages from conversation data and providing message operations
 */
export const useChatMessages = (conversationData: ConversationData | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages from conversation data
  useEffect(() => {
    if (conversationData?.exists && conversationData.messages?.length) {
      const loadedMessages: ChatMessage[] = conversationData.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        schema: msg.schema,
        erdSchema: msg.erdSchema,
        ddl: msg.ddl,
        runId: msg.runId,
        diagramType: msg.diagramType,
      }));
      setMessages(loadedMessages);
    }
  }, [conversationData]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    resetMessages,
  };
};
