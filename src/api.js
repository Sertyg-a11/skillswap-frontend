const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function createApi(tokenProvider) {
  async function request(path, { method = "GET", body, headers, signal } = {}) {
    const token = typeof tokenProvider === "function" ? await tokenProvider() : tokenProvider;

    const finalHeaders = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    };

    // Only set Content-Type when sending JSON body
    const hasJsonBody = body !== undefined && body !== null;
    if (hasJsonBody) finalHeaders["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: hasJsonBody ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!res.ok) {
      const parsed = await parseBody(res);
      const msg =
        (parsed && (parsed.message || parsed.error || parsed.title)) ||
        `Request failed (${res.status})`;
      throw new ApiError(msg, { status: res.status, body: parsed });
    }

    if (res.status === 204) return null;
    return parseBody(res);
  }

  return {
    // User endpoints
    me: (opts) => request("/api/users/me", { method: "GET", ...opts }),
    updateProfile: (payload, opts) => request("/api/users/me/profile", { method: "PUT", body: payload, ...opts }),
    updatePreferences: (payload, opts) =>
      request("/api/users/me/preferences", { method: "PUT", body: payload, ...opts }),
    deleteMe: (opts) => request("/api/users/me", { method: "DELETE", ...opts }),
    getUser: (userId, opts) => request(`/api/users/${userId}`, { method: "GET", ...opts }),

    // Skills endpoints
    mySkills: (opts) => request("/api/skills/me", { method: "GET", ...opts }),
    addSkill: (payload, opts) => request("/api/skills/me", { method: "POST", body: payload, ...opts }),
    getUserSkills: (userId, opts) => request(`/api/skills/user/${userId}`, { method: "GET", ...opts }),

    // Search endpoints
    searchUsers: (query, type = "ALL", opts) => {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (type) params.append("type", type);
      return request(`/api/users/search?${params.toString()}`, { method: "GET", ...opts });
    },

    // Conversation endpoints
    getConversations: (opts) => request("/api/conversations", { method: "GET", ...opts }),
    getConversation: (conversationId, opts) => request(`/api/conversations/${conversationId}`, { method: "GET", ...opts }),

    // Message endpoints
    getMessages: (conversationId, { before, size = 50, ...opts } = {}) => {
      const params = new URLSearchParams();
      if (before) params.append("before", before);
      if (size) params.append("size", size.toString());
      const query = params.toString();
      return request(`/api/messages/conversation/${conversationId}${query ? `?${query}` : ""}`, { method: "GET", ...opts });
    },
    sendMessage: (recipientId, body, opts) =>
      request(`/api/messages/to/${recipientId}`, { method: "POST", body: { body }, ...opts }),
    markRead: (conversationId, opts) =>
      request(`/api/messages/conversation/${conversationId}/read`, { method: "POST", ...opts }),

    // GDPR endpoints
    exportGdpr: (opts) => request("/api/gdpr/export", { method: "GET", ...opts }),
  };
}

export { ApiError };

