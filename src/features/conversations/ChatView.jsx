import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import { useWebSocket } from "../../services/useWebSocket";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import Spinner from "../../shared/ui/Spinner";

function formatMessageTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
}

function MessageBubble({ message, isOwn, showDate, dateLabel }) {
  return (
    <>
      {showDate && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 text-xs text-slate-500 bg-slate-100 rounded-full">
            {dateLabel}
          </span>
        </div>
      )}
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-900 rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-xs ${
                isOwn ? "text-blue-200" : "text-slate-400"
              }`}
            >
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && message.readAt && (
              <svg
                className="w-3 h-3 text-blue-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TypingIndicator({ userName }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="bg-slate-100 px-4 py-2 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      <span className="text-xs text-slate-500">{userName} is typing...</span>
    </div>
  );
}

export default function ChatView({ conversation, me, onBack }) {
  const { api } = useAuth();
  const {
    connected: wsConnected,
    onMessage,
    onReadReceipt,
    onTyping,
    sendTypingIndicator,
  } = useWebSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  // Message-service now uses database UUID as senderId (after refactor)
  const currentUserId = me?.id;
  const otherUser = conversation?.otherUser;

  // Load messages on mount
  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      markAsRead();
    }
  }, [conversation?.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubMessage = onMessage((message) => {
      if (message.conversationId === conversation?.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        markAsRead();
      }
    });

    const unsubReadReceipt = onReadReceipt((receipt) => {
      if (receipt.conversationId === conversation?.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUserId ? { ...msg, readAt: new Date().toISOString() } : msg
          )
        );
      }
    });

    const unsubTyping = onTyping((typing) => {
      if (typing.conversationId === conversation?.id && typing.userId !== currentUserId) {
        setIsOtherTyping(typing.isTyping);
        if (typing.isTyping) {
          // Clear typing indicator after 3 seconds
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 3000);
        }
      }
    });

    return () => {
      unsubMessage();
      unsubReadReceipt();
      unsubTyping();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [conversation?.id, currentUserId, onMessage, onReadReceipt, onTyping]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages.length, loading]);

  const loadMessages = async (before = null) => {
    try {
      if (!before) setLoading(true);
      setError(null);

      const data = await api.getMessages(conversation.id, { before, size: 50 });
      // Backend returns PageResponse { items: [...], hasMore: boolean }
      const messageList = Array.isArray(data) ? data : (data?.items || []);
      const hasMoreFromServer = data?.hasMore ?? false;

      if (before) {
        // Prepend older messages (reversed to show oldest first)
        setMessages((prev) => [...[...messageList].reverse(), ...prev]);
      } else {
        // Initial load - reverse to show oldest first, newest at bottom
        setMessages([...messageList].reverse());
      }

      setHasMore(hasMoreFromServer);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (messages.length > 0 && hasMore) {
      loadMessages(messages[0].createdAt);
    }
  };

  const markAsRead = async () => {
    try {
      await api.markRead(conversation.id);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Send typing indicator (stopped)
    sendTypingIndicator(conversation.id, false);

    try {
      const sent = await api.sendMessage(otherUser.id, messageText);
      setMessages((prev) => [...prev, sent]);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator (throttled)
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      sendTypingIndicator(conversation.id, true);
      lastTypingSentRef.current = now;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Group messages by date
  const getDateLabel = (index) => {
    if (index === 0) return formatMessageDate(messages[0].createdAt);

    const currentDate = new Date(messages[index].createdAt).toDateString();
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();

    if (currentDate !== prevDate) {
      return formatMessageDate(messages[index].createdAt);
    }
    return null;
  };

  return (
    <Card className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="md:hidden p-1 -ml-1 rounded-lg hover:bg-slate-100"
        >
          <svg
            className="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">
            {otherUser?.displayName?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {otherUser?.displayName || "Unknown User"}
          </h3>
          {wsConnected ? (
            <p className="text-xs text-green-600">Online</p>
          ) : (
            <p className="text-xs text-slate-500">Offline</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner label="Loading messages..." />
          </div>
        ) : (
          <>
            {hasMore && messages.length > 0 && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={loadMoreMessages}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Load older messages
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const dateLabel = getDateLabel(index);
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    showDate={dateLabel !== null}
                    dateLabel={dateLabel}
                  />
                );
              })
            )}

            {isOtherTyping && <TypingIndicator userName={otherUser?.displayName} />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-t border-red-200">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
            style={{ minHeight: "40px" }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="rounded-xl px-4 py-2"
          >
            {sending ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
