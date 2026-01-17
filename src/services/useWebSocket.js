import { useEffect, useState, useCallback, useRef } from "react";
import { websocketService } from "./websocket";
import { useAuth } from "../features/auth/useAuth";

/**
 * React hook for WebSocket functionality.
 * Automatically connects when authenticated and disconnects on unmount.
 */
export function useWebSocket() {
  const { authenticated, getToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    if (authenticated && !websocketService.isConnected() && !connectingRef.current) {
      connectingRef.current = true;
      websocketService
        .connect(getToken)
        .then(() => {
          setConnected(true);
          setError(null);
        })
        .catch((err) => {
          console.error("WebSocket connection error:", err);
          setError(err.message);
        })
        .finally(() => {
          connectingRef.current = false;
        });
    }

    const unsubscribe = websocketService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [authenticated, getToken]);

  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    websocketService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  return {
    connected,
    error,
    sendTypingIndicator,
    onMessage: (handler) => websocketService.onMessage(handler),
    onConversationUpdate: (handler) => websocketService.onConversationUpdate(handler),
    onReadReceipt: (handler) => websocketService.onReadReceipt(handler),
    onTyping: (handler) => websocketService.onTyping(handler),
  };
}
