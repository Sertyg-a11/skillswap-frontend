import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createKeycloak } from "./keycloak";
import { createApi } from "../../api";

export const AuthContext = createContext(null);

// module singleton to avoid re-creating the Keycloak instance
const keycloak = createKeycloak();

export default function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);

  const initOnceRef = useRef(null);

  const getToken = useCallback(async () => {
    if (!keycloak?.authenticated) return null;
    try {
      await keycloak.updateToken(30);
    } catch {
      return null;
    }
    return keycloak.token || null;
  }, []);

  const api = useMemo(() => createApi(getToken), [getToken]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!initOnceRef.current) {
          initOnceRef.current = keycloak.init({
            // IMPORTANT: do NOT force redirect
            onLoad: "check-sso",
            pkceMethod: "S256",
            checkLoginIframe: false,

            // Optional, but recommended if you want silent SSO checks:
            // silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          });
        }

        const ok = await initOnceRef.current;
        if (cancelled) return;

        setAuthenticated(Boolean(ok));
        setToken(keycloak.token || null);
        setProfile(keycloak.tokenParsed || null);

        const interval = window.setInterval(async () => {
          const t = await getToken();
          if (t) setToken(t);
        }, 15_000);

        return () => window.clearInterval(interval);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const login = useCallback(() => keycloak.login(), []);
  const logout = useCallback(() => keycloak.logout(), []);

  const value = useMemo(
    () => ({ ready, authenticated, token, profile, login, logout, api, getToken }),
    [ready, authenticated, token, profile, login, logout, api, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
