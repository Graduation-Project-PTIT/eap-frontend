import { useState, useEffect, useCallback } from "react";
import type { ERDSchema, DiagramType } from "@/api/services/chat-service";

interface ConversationData {
  exists: boolean;
  currentDdl?: string | null;
  erdSchema?: ERDSchema | null;
  diagramType?: DiagramType;
  messages?: Array<{
    ddl?: string | null;
  }>;
}

/**
 * Custom hook for managing chat schema state (DDL, ERD, diagram type)
 * Handles loading and updating schema-related data from conversation
 */
export const useChatSchema = (conversationData: ConversationData | undefined) => {
  const [currentDdl, setCurrentDdl] = useState<string | null>(null);
  const [currentErdSchema, setCurrentErdSchema] = useState<ERDSchema | null>(null);
  const [diagramType, setDiagramType] = useState<DiagramType | undefined>(undefined);

  // Load schema data from conversation
  useEffect(() => {
    if (conversationData?.exists) {
      // Load DDL - simplified logic with fallback to messages
      // Use reverse iteration instead of findLast for better compatibility
      let ddl = conversationData.currentDdl || null;
      if (!ddl && conversationData.messages) {
        for (let i = conversationData.messages.length - 1; i >= 0; i--) {
          if (conversationData.messages[i].ddl) {
            ddl = conversationData.messages[i].ddl || null;
            break;
          }
        }
      }
      setCurrentDdl(ddl);

      // Load ERD Schema
      setCurrentErdSchema(conversationData.erdSchema || null);

      // Load diagram type
      setDiagramType(conversationData.diagramType);
    }
  }, [conversationData]);

  const updateDdl = useCallback((ddl: string | null) => {
    setCurrentDdl(ddl);
  }, []);

  const updateErdSchema = useCallback((erdSchema: ERDSchema | null) => {
    setCurrentErdSchema(erdSchema);
  }, []);

  const updateDiagramType = useCallback((type: DiagramType | undefined) => {
    setDiagramType(type);
  }, []);

  const resetSchema = useCallback(() => {
    setCurrentDdl(null);
    setCurrentErdSchema(null);
    setDiagramType(undefined);
  }, []);

  return {
    currentDdl,
    currentErdSchema,
    diagramType,
    setCurrentDdl,
    setCurrentErdSchema,
    setDiagramType,
    updateDdl,
    updateErdSchema,
    updateDiagramType,
    resetSchema,
  };
};
