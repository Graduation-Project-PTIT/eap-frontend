import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "../query-client";
import type { ERDEntity } from "./evaluation-service";

// Types and Interfaces
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  schema?: { entities: ERDEntity[] };
  ddl?: string;
  runId?: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  enableSearch?: boolean;
}

export interface ChatResponse {
  success: boolean;
  conversationId: string;
  response: string;
  schema: { entities: ERDEntity[] };
  ddl: string;
  runId: string;
}

export interface ConversationHistory {
  success: boolean;
  conversationId: string;
  exists: boolean;
  schema: { entities: ERDEntity[] } | null;
  thread: {
    title: string;
    createdAt: string;
    updatedAt: string;
  };
}

// API Functions
export const chatApi = {
  // Send message - POST /chat
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await chatClient.post<ChatResponse>("", {
      conversationId: request.conversationId,
      message: request.message,
      enableSearch: request.enableSearch ?? false,
    });
    return response.data;
  },

  // Get conversation - GET /chat/:conversationId
  getConversation: async (conversationId: string): Promise<ConversationHistory> => {
    const response = await chatClient.get<ConversationHistory>(`/${conversationId}`);
    return response.data;
  },

  // Reset conversation - POST /chat/reset
  resetConversation: async (conversationId: string): Promise<void> => {
    await chatClient.post("/reset", { conversationId });
  },
};

// React Query Hooks
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      // Invalidate conversation to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(data.conversationId),
      });
    },
  });
};

export const useConversation = (conversationId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.chat.conversation(conversationId || ""),
    queryFn: () => chatApi.getConversation(conversationId!),
    enabled: enabled && !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useResetConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.resetConversation,
    onSuccess: (_, conversationId) => {
      // Invalidate conversation to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(conversationId),
      });
    },
  });
};
