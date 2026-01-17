import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * WebSocket service for real-time messaging.
 * Uses STOMP over SockJS for reliable WebSocket communication.
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Set();
    this.conversationHandlers = new Set();
    this.readReceiptHandlers = new Set();
    this.typingHandlers = new Set();
    this.connectionHandlers = new Set();
  }

  /**
   * Connect to WebSocket server with authentication.
   * @param {Function} tokenProvider - Function that returns JWT token
   */
  connect(tokenProvider) {
    if (this.client && this.connected) {
      console.log("WebSocket already connected");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const getToken = async () => {
        const token = typeof tokenProvider === "function"
          ? await tokenProvider()
          : tokenProvider;
        return token;
      };

      getToken().then((token) => {
        this.client = new Client({
          webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            if (import.meta.env.DEV) {
              console.log("[STOMP]", str);
            }
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("WebSocket connected");
            this.connected = true;
            this.subscribeToQueues();
            this.notifyConnectionHandlers(true);
            resolve();
          },
          onDisconnect: () => {
            console.log("WebSocket disconnected");
            this.connected = false;
            this.notifyConnectionHandlers(false);
          },
          onStompError: (frame) => {
            console.error("STOMP error:", frame.headers["message"]);
            reject(new Error(frame.headers["message"]));
          },
        });

        this.client.activate();
      }).catch(reject);
    });
  }

  /**
   * Subscribe to user-specific message queues.
   */
  subscribeToQueues() {
    if (!this.client || !this.connected) return;

    // Subscribe to new messages
    this.subscriptions.set(
      "messages",
      this.client.subscribe("/user/queue/messages", (message) => {
        const data = JSON.parse(message.body);
        this.notifyMessageHandlers(data);
      })
    );

    // Subscribe to conversation updates (unread counts)
    this.subscriptions.set(
      "conversations",
      this.client.subscribe("/user/queue/conversations", (message) => {
        const data = JSON.parse(message.body);
        this.notifyConversationHandlers(data);
      })
    );

    // Subscribe to read receipts
    this.subscriptions.set(
      "read-receipts",
      this.client.subscribe("/user/queue/read-receipts", (message) => {
        const data = JSON.parse(message.body);
        this.notifyReadReceiptHandlers(data);
      })
    );

    // Subscribe to typing indicators
    this.subscriptions.set(
      "typing",
      this.client.subscribe("/user/queue/typing", (message) => {
        const data = JSON.parse(message.body);
        this.notifyTypingHandlers(data);
      })
    );
  }

  /**
   * Send typing indicator to conversation partner.
   */
  sendTypingIndicator(conversationId, isTyping) {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/typing",
      body: JSON.stringify({ conversationId, isTyping }),
    });
  }

  /**
   * Disconnect from WebSocket server.
   */
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected.
   */
  isConnected() {
    return this.connected;
  }

  // Event handler registration
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConversationUpdate(handler) {
    this.conversationHandlers.add(handler);
    return () => this.conversationHandlers.delete(handler);
  }

  onReadReceipt(handler) {
    this.readReceiptHandlers.add(handler);
    return () => this.readReceiptHandlers.delete(handler);
  }

  onTyping(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onConnectionChange(handler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  // Notify handlers
  notifyMessageHandlers(data) {
    this.messageHandlers.forEach((handler) => handler(data));
  }

  notifyConversationHandlers(data) {
    this.conversationHandlers.forEach((handler) => handler(data));
  }

  notifyReadReceiptHandlers(data) {
    this.readReceiptHandlers.forEach((handler) => handler(data));
  }

  notifyTypingHandlers(data) {
    this.typingHandlers.forEach((handler) => handler(data));
  }

  notifyConnectionHandlers(connected) {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
