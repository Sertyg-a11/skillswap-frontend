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
    me: (opts) => request("/api/users/me", { method: "GET", ...opts }),
    updateProfile: (payload, opts) => request("/api/users/me/profile", { method: "PUT", body: payload, ...opts }),
    updatePreferences: (payload, opts) =>
      request("/api/users/me/preferences", { method: "PUT", body: payload, ...opts }),
    deleteMe: (opts) => request("/api/users/me", { method: "DELETE", ...opts }),

    mySkills: (opts) => request("/api/skills/me", { method: "GET", ...opts }),
    addSkill: (payload, opts) => request("/api/skills/me", { method: "POST", body: payload, ...opts }),

    exportGdpr: (opts) => request("/api/gdpr/export", { method: "GET", ...opts }),
  };
}
