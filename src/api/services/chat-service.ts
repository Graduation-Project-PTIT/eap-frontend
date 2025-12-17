import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-client";
import type { DBEntity } from "./evaluation-service";
import { aiServiceClient } from "@/api";

// Types and Interfaces
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  schema?: { entities: DBEntity[] };
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
  schema: { entities: DBEntity[] };
  ddl: string;
  runId: string;
  blocked?: boolean; // Flag indicating if schema creation was blocked
}

export interface Conversation {
  id: string;
  conversationTitle: string;
  status: string;
  createdAt: string;
  lastMessageAt: string | null;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  conversations: Conversation[];
  total: number;
}

export interface ConversationHistory {
  success: boolean;
  conversationId: string;
  exists: boolean;
  schema: { entities: DBEntity[] } | null;
  currentDdl?: string | null; // Current DDL script from conversation
  thread: {
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  messages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    schema?: { entities: DBEntity[] };
    ddl?: string;
    runId?: string;
    intent?: string;
  }>;
}

// API Functions
export const chatApi = {
  // List conversations - GET /ai/conversations
  listConversations: async (): Promise<ConversationListResponse> => {
    const response = await aiServiceClient.get<ConversationListResponse>("/conversations");
    return response.data;
  },

  // Send message - POST /ai/chat
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await aiServiceClient.post<ChatResponse>("/chat", {
      conversationId: request.conversationId,
      message: request.message,
      enableSearch: request.enableSearch ?? false,
    });
    return response.data;
  },

  // Get conversation - GET /ai/conversation/:conversationId
  getConversation: async (conversationId: string): Promise<ConversationHistory> => {
    const response = await aiServiceClient.get<ConversationHistory>(`/chat/${conversationId}`);
    return response.data;
  },

  // Reset conversation - POST /ai/chat/reset
  resetConversation: async (conversationId: string): Promise<void> => {
    await aiServiceClient.post("/chat/reset", { conversationId });
  },

  // Update conversation schema - PUT /ai/chat/:conversationId/schema
  updateConversationSchema: async (
    conversationId: string,
    schema: { entities: DBEntity[] },
    regenerateDDL = true,
  ): Promise<ChatResponse> => {
    const response = await aiServiceClient.put<ChatResponse>(`/chat/${conversationId}/schema`, {
      schemaJson: schema,
      regenerateDDL,
    });
    return response.data;
  },
};

// React Query Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: chatApi.listConversations,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      // Invalidate conversation to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(data.conversationId),
      });
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
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

export const useUpdateConversationSchema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      schema,
      regenerateDDL,
    }: {
      conversationId: string;
      schema: { entities: DBEntity[] };
      regenerateDDL?: boolean;
    }) => chatApi.updateConversationSchema(conversationId, schema, regenerateDDL),

    onSuccess: (data) => {
      // Invalidate conversation to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(data.conversationId),
      });
      // Invalidate conversations list to update last modified timestamp
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
      });
    },
  });
};
