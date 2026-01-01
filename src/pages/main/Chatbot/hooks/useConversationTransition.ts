import { useState, useEffect, useRef } from "react";
import { generateConversationId } from "../utils/conversationUtils";

/**
 * Custom hook for managing conversation transitions
 * Handles conversation ID generation and state reset logic when switching conversations
 */
export const useConversationTransition = (conversationId: string | undefined) => {
  const isNewConversation = !conversationId;

  // Track previous conversationId to detect transitions
  const prevConversationIdRef = useRef<string | undefined>(conversationId);

  // Generate UUID for new conversations
  const [localConversationId, setLocalConversationId] = useState(
    () => conversationId || generateConversationId(),
  );

  // Detect if transitioning from new conversation to first message
  const [isTransitioningFromNewToFirst, setIsTransitioningFromNewToFirst] = useState(false);

  useEffect(() => {
    const prevConversationId = prevConversationIdRef.current;
    const isTransition = prevConversationId === undefined && conversationId !== undefined;

    setIsTransitioningFromNewToFirst(isTransition);

    if (!conversationId) {
      // Generate new conversation ID
      setLocalConversationId(generateConversationId());
    } else {
      // Update local ID to match route
      setLocalConversationId(conversationId);
    }

    // Update the ref for next comparison
    prevConversationIdRef.current = conversationId;
  }, [conversationId]);

  return {
    localConversationId,
    isNewConversation,
    isTransitioningFromNewToFirst,
  };
};
