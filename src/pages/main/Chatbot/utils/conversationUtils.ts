// Generate a new conversation ID
export const generateConversationId = (): string => {
  return crypto.randomUUID();
};

// Format timestamp for message display
export const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Smooth scroll to bottom of container
export const scrollToBottom = (containerRef: React.RefObject<HTMLElement>) => {
  if (containerRef.current) {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
};
