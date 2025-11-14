import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";
import { useSendMessage } from "@/api/services/chat-service";
import type { ChatMessage } from "@/api/services/chat-service";
import type { ERDEntity } from "@/api/services/evaluation-service";
import WelcomeView from "./components/WelcomeView";
import ChatView from "./components/ChatView";
import ERDSidebar from "./components/ERDSidebar";
import { generateConversationId } from "./utils/conversationUtils";
import { createUserMessage, createAssistantMessage } from "./utils/messageUtils";
import "./styles/animations.css";

const Chatbot = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const isNewConversation = !conversationId;

  // Generate UUID for new conversations
  const [localConversationId] = useState(() => conversationId || generateConversationId());

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<{ entities: ERDEntity[] } | null>(null);
  const [currentDdl, setCurrentDdl] = useState<string | null>(null);

  // API hooks
  const sendMessage = useSendMessage();

  // TODO: Implement when backend supports message history
  // const { data: conversationData } = useConversation(conversationId, {
  //   enabled: !!conversationId,
  // });

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
        enableSearch: false,
      });

      const assistantMessage = createAssistantMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);

      // Update current schema and DDL
      if (response.schema && response.schema.entities.length > 0) {
        setCurrentSchema(response.schema);
        setCurrentDdl(response.ddl);
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
    <div className="relative h-full">
      {/* Toggle ERD Sidebar Button - Only show when there's a schema and sidebar is closed */}
      {currentSchema && !showSidebar && !isNewConversation && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-20 right-4 z-40"
          onClick={() => setShowSidebar(true)}
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>
      )}

      {/* Main Content */}
      <div className={showSidebar ? "mr-[600px]" : ""}>
        {isNewConversation ? (
          <WelcomeView
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            isLoading={sendMessage.isPending}
            onSuggestedPromptClick={handleSuggestedPromptClick}
          />
        ) : (
          <ChatView
            messages={messages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            isLoading={sendMessage.isPending}
            error={error}
            onRetry={handleRetry}
            onSchemaClick={handleSchemaClick}
          />
        )}
      </div>

      {/* ERD Sidebar */}
      <ERDSidebar
        schema={currentSchema}
        ddl={currentDdl}
        isOpen={showSidebar}
        onToggle={() => setShowSidebar(!showSidebar)}
      />
    </div>
  );
};

export default Chatbot;
