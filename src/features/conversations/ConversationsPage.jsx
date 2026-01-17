import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useWebSocket } from "../../services/useWebSocket";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import Spinner from "../../shared/ui/Spinner";
import Alert from "../../shared/ui/Alert";
import ConversationList from "./ConversationList";
import ChatView from "./ChatView";

export default function ConversationsPage() {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);

  const {
    connected: wsConnected,
    onMessage,
    onConversationUpdate,
    onReadReceipt,
  } = useWebSocket();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [api]);

  // Handle URL params for direct conversation access
  useEffect(() => {
    const convId = searchParams.get("id");
    if (convId) {
      setSelectedConversationId(convId);
    }
  }, [searchParams]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubMessage = onMessage((message) => {
      // Update conversation in list with new message preview
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessageAt: message.createdAt,
                lastMessagePreview: message.body?.substring(0, 50),
              }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    const unsubConversation = onConversationUpdate((update) => {
      // Update unread count for conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === update.conversationId
            ? { ...conv, unreadCount: update.unreadCount }
            : conv
        )
      );
    });

    return () => {
      unsubMessage();
      unsubConversation();
    };
  }, [onMessage, onConversationUpdate]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current user and conversations in parallel
      const [meData, conversationsData] = await Promise.all([
        api.me(),
        api.getConversations()
      ]);

      setMe(meData);
      const rawConversations = conversationsData || [];

      // Fetch user details for each conversation's otherUserId
      const enrichedConversations = await Promise.all(
        rawConversations.map(async (conv) => {
          try {
            const otherUser = await api.getUser(conv.otherUserId);
            return { ...conv, otherUser };
          } catch {
            // If user fetch fails, return conversation with minimal otherUser
            return {
              ...conv,
              otherUser: { id: conv.otherUserId, displayName: "Unknown User" }
            };
          }
        })
      );

      setConversations(enrichedConversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setSearchParams({ id: conversationId });

    // Clear unread count when selecting conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setSearchParams({});
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner label="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Connection status indicator */}
      {!wsConnected && (
        <div className="mb-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          Connecting to real-time updates...
        </div>
      )}

      {error && (
        <Alert className="mb-4">
          {error}
          <Button
            variant="secondary"
            className="ml-4 text-xs"
            onClick={loadConversations}
          >
            Retry
          </Button>
        </Alert>
      )}

      <div className="flex h-full gap-4">
        {/* Conversation List - Hidden on mobile when conversation selected */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
            selectedConversationId ? "hidden md:block" : ""
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Chat View */}
        <div
          className={`flex-1 ${
            selectedConversationId ? "" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <ChatView
              conversation={selectedConversation}
              me={me}
              onBack={handleBackToList}
            />
          ) : (
            <Card className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-slate-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
