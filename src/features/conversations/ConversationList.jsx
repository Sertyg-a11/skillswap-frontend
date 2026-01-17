import { Link } from "react-router-dom";
import Card from "../../shared/ui/Card";
import Badge from "../../shared/ui/Badge";

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

function ConversationItem({ conversation, isSelected, onSelect }) {
  const { id, otherUser, lastMessageAt, lastMessagePreview, unreadCount } =
    conversation;

  return (
    <button
      onClick={() => onSelect(id)}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isSelected
          ? "bg-blue-50 border-blue-200 border"
          : "hover:bg-slate-50 border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-slate-600">
            {otherUser?.displayName?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-medium truncate ${
                unreadCount > 0 ? "text-slate-900" : "text-slate-700"
              }`}
            >
              {otherUser?.displayName || "Unknown User"}
            </span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatTime(lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p
              className={`text-sm truncate ${
                unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-500"
              }`}
            >
              {lastMessagePreview || "No messages yet"}
            </p>
            {unreadCount > 0 && (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}) {
  if (conversations.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Messages</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-slate-500">
            <svg
              className="w-12 h-12 mx-auto text-slate-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1">
              Search for users and start a conversation
            </p>
            <Link
              to="/app/search"
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Find users to message
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Messages</h2>
          <span className="text-sm text-slate-500">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="p-3 border-t border-slate-200">
        <Link
          to="/app/search"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Find new users
        </Link>
      </div>
    </Card>
  );
}
