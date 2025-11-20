import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSendMessage, useConversation } from "@/api/services/chat-service";
import type { ChatMessage } from "@/api/services/chat-service";
import type { ERDEntity } from "@/api/services/evaluation-service";
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
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<{ entities: ERDEntity[] } | null>(null);
  const [currentDdl, setCurrentDdl] = useState<string | null>(null);
  const [enableSearch, setEnableSearch] = useState(true); // Enable web search by default

  // Reset state when navigating to new conversation
  useEffect(() => {
    if (!conversationId) {
      // Generate new conversation ID
      setLocalConversationId(generateConversationId());
      // Reset all state
      setMessages([]);
      setInputValue("");
      setError(null);
      setCurrentSchema(null);
      setCurrentDdl(null);
      setShowSidebar(false);
    } else {
      // Update local ID to match route
      setLocalConversationId(conversationId);
    }
  }, [conversationId]);

  // API hooks
  const sendMessage = useSendMessage();
  const { data: conversationData } = useConversation(conversationId, !!conversationId);

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

      // Set the schema if available
      if (conversationData.schema) {
        setCurrentSchema(conversationData.schema);
        // Find the latest DDL from messages (iterate backwards without mutating)
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

      // Update current schema and DDL (only if not blocked)
      if (!response.blocked && response.schema && response.schema.entities.length > 0) {
        setCurrentSchema(response.schema);
        setCurrentDdl(response.ddl);
      } else if (response.blocked) {
        // Show dialog that creation was blocked
        setShowBlockedDialog(true);
      }
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
        />
      </div>

      {/* Blocked Schema Creation Dialog */}
      <AlertDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Cannot Create New Schema
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                This conversation already has an existing database schema. To keep conversations
                organized and focused:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Each conversation specializes in one domain/schema</li>
                <li>Easier to track schema evolution</li>
                <li>Cleaner context for better AI responses</li>
              </ul>
              <p className="font-medium">
                Please start a <strong>New Conversation</strong> for your new schema design, or
                modify the existing schema in this conversation.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/chat")}>
              Start New Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chatbot;
