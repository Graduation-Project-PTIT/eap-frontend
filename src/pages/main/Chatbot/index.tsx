import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";
import {
  useSendMessage,
  useConversation,
  useUpdateConversationSchema,
} from "@/api/services/chat-service";
import type { ChatMessage } from "@/api/services/chat-service";
import { useSchemaState } from "./hooks/useSchemaState";
import { toast } from "@/lib/toast";
import WelcomeView from "./components/WelcomeView";
import ChatView from "./components/ChatView";
import ERDSidebar from "./components/ERDSidebar";
import ConversationList from "./components/ConversationList";
import { generateConversationId } from "./utils/conversationUtils";
import { createUserMessage, createAssistantMessage } from "./utils/messageUtils";
import { cn } from "@/lib/utils";
import "./styles/animations.css";

const Chatbot = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const isNewConversation = !conversationId;

  // Generate UUID for new conversations - regenerate when conversationId changes
  const [localConversationId, setLocalConversationId] = useState(
    () => conversationId || generateConversationId(),
  );

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Show history sidebar by default
  const [currentDdl, setCurrentDdl] = useState<string | null>(null);
  const [enableSearch, setEnableSearch] = useState(true); // Enable web search by default

  // API hooks
  const sendMessage = useSendMessage();
  const { data: conversationData } = useConversation(conversationId, !!conversationId);
  const updateConversationSchema = useUpdateConversationSchema();

  // Schema state management with dirty tracking
  const {
    schema: currentSchema,
    isDirty: isSchemaDirty,
    updateEntity,
    resetDirty,
  } = useSchemaState(conversationData?.schema || null);

  // Reset state when navigating to new conversation
  useEffect(() => {
    if (!conversationId) {
      // Generate new conversation ID
      setLocalConversationId(generateConversationId());
      // Reset all state
      setMessages([]);
      setInputValue("");
      setError(null);
      setCurrentDdl(null);
      setShowSidebar(false);
    } else {
      // Update local ID to match route
      setLocalConversationId(conversationId);
    }
  }, [conversationId]);

  // Load conversation history on mount
  useEffect(() => {
    if (conversationData && conversationData.exists) {
      // Load messages from conversation history
      if (conversationData.messages && conversationData.messages.length > 0) {
        const loadedMessages: ChatMessage[] = conversationData.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          schema: msg.schema,
          ddl: msg.ddl,
          runId: msg.runId,
        }));
        setMessages(loadedMessages);
      }

      // Load DDL - prioritize currentDdl from conversation, fallback to latest message
      if (conversationData.currentDdl) {
        // Use DDL from conversation (most up-to-date after schema updates)
        setCurrentDdl(conversationData.currentDdl);
      } else if (conversationData.messages) {
        // Fallback: Find the latest DDL from messages
        const lastMessageWithDdl = conversationData.messages
          ?.slice()
          .reverse()
          .find((msg) => msg.ddl);
        if (lastMessageWithDdl?.ddl) {
          setCurrentDdl(lastMessageWithDdl.ddl);
        }
      }
    }
  }, [conversationData]);

  // Handle save schema
  const handleSaveSchema = async () => {
    if (!conversationId || !currentSchema || !isSchemaDirty) return;

    try {
      const response = await updateConversationSchema.mutateAsync({
        conversationId,
        schema: currentSchema,
        regenerateDDL: true,
      });

      if (response.ddl) {
        setCurrentDdl(response.ddl);
      }

      resetDirty();
      toast.success("Schema saved", {
        description: "Your schema changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save schema:", error);
      toast.error("Save failed", {
        description: "Failed to save schema. Please try again.",
      });
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const userMessage = createUserMessage(inputValue);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError(null);

    // Navigate to conversation URL if this is the first message
    if (isNewConversation) {
      navigate(`/chat/${localConversationId}`, { replace: true });
    }

    try {
      const response = await sendMessage.mutateAsync({
        conversationId: localConversationId,
        message: inputValue,
        enableSearch: enableSearch,
      });

      const assistantMessage = createAssistantMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);

      // Update current DDL (only if not blocked)
      if (!response.blocked && response.schema && response.schema.entities.length > 0) {
        setCurrentDdl(response.ddl);
      }
      // Note: If blocked, the assistant message with the explanation is already added above
    } catch (err) {
      console.error("Chat error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle suggested prompt click
  const handleSuggestedPromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    if (inputValue.trim()) {
      handleSend();
    }
  };

  // Handle schema click
  const handleSchemaClick = () => {
    setShowSidebar(true);
  };

  return (
    <div className="relative h-[calc(100vh-64px)] flex overflow-hidden -m-4">
      {/* Left Sidebar - Toggleable history */}
      {showHistory && (
        <div className="w-90 border-r bg-background flex-shrink-0 flex flex-col h-full overflow-hidden">
          <ConversationList currentConversationId={conversationId} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Header with toggle buttons - Only show in chat view */}
        {!isNewConversation && (
          <div className="border-b bg-background px-4 py-3 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <PanelRightOpen className={cn("h-4 w-4", showHistory && "rotate-180")} />
                <span className="ml-2">{showHistory ? "Hide" : "Show"} History</span>
              </Button>
            </div>

            {currentSchema && (
              <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)}>
                <PanelRightOpen className="h-4 w-4 mr-2" />
                View Schema
              </Button>
            )}
          </div>
        )}

        {isNewConversation ? (
          <WelcomeView
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            isLoading={sendMessage.isPending}
            onSuggestedPromptClick={handleSuggestedPromptClick}
            enableSearch={enableSearch}
            onEnableSearchChange={setEnableSearch}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatView
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSend}
              isLoading={sendMessage.isPending}
              error={error}
              onRetry={handleRetry}
              onSchemaClick={handleSchemaClick}
              enableSearch={enableSearch}
              onEnableSearchChange={setEnableSearch}
            />
          </div>
        )}

        {/* ERD Sidebar - Slides from right */}
        <ERDSidebar
          schema={currentSchema}
          ddl={currentDdl}
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
          onEntityUpdate={updateEntity}
          onSaveSchema={handleSaveSchema}
          isSchemaDirty={isSchemaDirty}
          isSaving={updateConversationSchema.isPending}
        />
      </div>
    </div>
  );
};

export default Chatbot;
