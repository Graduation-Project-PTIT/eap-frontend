import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";
import {
  useSendMessage,
  useConversation,
  useUpdateConversationSchema,
} from "@/api/services/chat-service";
import { useSchemaState } from "./hooks/useSchemaState";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatSchema } from "./hooks/useChatSchema";
import { useConversationTransition } from "./hooks/useConversationTransition";
import { toast } from "@/lib/toast";
import WelcomeView from "./components/WelcomeView";
import ChatView from "./components/ChatView";
import ERDSidebar from "./components/ERDSidebar";
import ConversationList from "./components/ConversationList";
import { createUserMessage, createAssistantMessage } from "./utils/messageUtils";
import { cn } from "@/lib/utils";
import "./styles/animations.css";

const Chatbot = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  // Custom hooks for state management
  const { localConversationId, isNewConversation, isTransitioningFromNewToFirst } =
    useConversationTransition(conversationId);

  // API hooks
  const sendMessage = useSendMessage();
  const { data: conversationData } = useConversation(conversationId, !!conversationId);
  const updateConversationSchema = useUpdateConversationSchema();

  // Messages state
  const { messages, addMessage, resetMessages } = useChatMessages(conversationData);

  // Schema state
  const {
    currentDdl,
    currentErdSchema,
    diagramType,
    setCurrentDdl,
    setCurrentErdSchema,
    setDiagramType,
    resetSchema,
  } = useChatSchema(conversationData);

  // Local UI state
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);

  // Schema state management with dirty tracking
  const {
    schema: currentSchema,
    isDirty: isSchemaDirty,
    updateEntity,
    resetDirty,
  } = useSchemaState(conversationData?.schema || null);

  // Reset state when switching conversations (not on first message)
  useEffect(() => {
    if (!isTransitioningFromNewToFirst && conversationId !== undefined) {
      // Only reset when switching between existing conversations
      if (!isNewConversation) {
        return; // Data loaded by hooks
      }
    }

    // Reset state for new conversations
    if (!conversationId) {
      resetMessages();
      setInputValue("");
      setError(null);
      resetSchema();
      setShowSidebar(false);
    }
  }, [
    conversationId,
    isNewConversation,
    isTransitioningFromNewToFirst,
    resetMessages,
    resetSchema,
  ]);

  // Handle save schema with useCallback
  const handleSaveSchema = useCallback(async () => {
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
  }, [conversationId, currentSchema, isSchemaDirty, updateConversationSchema, resetDirty]);

  // Handle sending a message with useCallback
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const userMessage = createUserMessage(inputValue);
    addMessage(userMessage);
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
      addMessage(assistantMessage);

      // Update schemas based on response (only if not blocked)
      if (!response.blocked) {
        // Update Physical DB schema and DDL
        if (response.schema && response.schema.entities.length > 0) {
          setCurrentDdl(response.ddl);
        }

        // Update ERD schema
        if (response.erdSchema) {
          setCurrentErdSchema(response.erdSchema);
        }

        // Update diagram type
        if (response.diagramType) {
          setDiagramType(response.diagramType);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
    }
  }, [
    inputValue,
    sendMessage,
    isNewConversation,
    localConversationId,
    enableSearch,
    navigate,
    addMessage,
  ]);

  // Handle suggested prompt click with useCallback
  const handleSuggestedPromptClick = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  // Handle retry after error with useCallback
  const handleRetry = useCallback(() => {
    setError(null);
    if (inputValue.trim()) {
      handleSend();
    }
  }, [inputValue, handleSend]);

  // Handle schema click with useCallback
  const handleSchemaClick = useCallback(() => {
    setShowSidebar(true);
  }, []);

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

            {(currentSchema || currentErdSchema) && (
              <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)}>
                <PanelRightOpen className="h-4 w-4 mr-2" />
                View {diagramType === "ERD" ? "ERD" : "Schema"}
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
          erdSchema={currentErdSchema}
          ddl={currentDdl}
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
          onEntityUpdate={updateEntity}
          onSaveSchema={handleSaveSchema}
          isSchemaDirty={isSchemaDirty}
          isSaving={updateConversationSchema.isPending}
          diagramType={diagramType}
        />
      </div>
    </div>
  );
};

export default Chatbot;
