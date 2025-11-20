import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trash2, Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useConversations } from "@/api/services/chat-service";
import type { Conversation } from "@/api/services/chat-service";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  currentConversationId?: string;
}

const ConversationList = ({ currentConversationId }: ConversationListProps) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useConversations();
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setDeleteConversationId(conversationId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConversationId) {
      // TODO: Implement delete API
      console.log("Delete conversation:", deleteConversationId);
      setDeleteConversationId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load conversations</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!data?.conversations || data.conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header with New Chat button */}
        <div className="shrink-0 p-4 border-b">
          <Button onClick={() => navigate("/chat")} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="relative mb-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary/10 rounded-full animate-pulse" />
          </div>
          <h3 className="text-base font-semibold mb-2 text-center">No chats yet</h3>
          <p className="text-muted-foreground text-center text-xs max-w-[200px]">
            Start a conversation to design your database schema
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Chat button - Always at top */}
      <div className="shrink-0 p-4 border-b space-y-3">
        <Button onClick={() => navigate("/chat")} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          {data.total} chat{data.total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-3">
          <div className="py-3 space-y-1.5">
            {data.conversations.map((conversation: Conversation) => {
              const isActive = currentConversationId === conversation.id;

              return (
                <Card
                  key={conversation.id}
                  className={cn(
                    "overflow-hidden transition-all cursor-pointer group rounded-lg",
                    isActive ? "bg-black dark:bg-white" : "bg-transparent border-0",
                  )}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <CardContent className="px-2 py-3">
                    <div className="flex items-center justify-between gap-2 w-full">
                      {/* Content - Full width text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-normal line-clamp-1",
                            isActive ? "font-medium text-white dark:text-black" : "text-foreground",
                          )}
                          title={conversation.conversationTitle}
                        >
                          {conversation.conversationTitle || "Untitled Conversation"}
                        </p>
                      </div>

                      {/* Delete Button - Show on hover */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                          isActive && "hover:bg-white/20 dark:hover:bg-black/20",
                        )}
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                      >
                        <Trash2
                          className={cn(
                            "h-3 w-3",
                            isActive
                              ? "text-white dark:text-black hover:text-red-400"
                              : "text-muted-foreground hover:text-destructive",
                          )}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={() => setDeleteConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationList;
