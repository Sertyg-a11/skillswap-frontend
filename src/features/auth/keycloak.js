// src/features/auth/keycloak.js
import Keycloak from "keycloak-js";

export function createKeycloak() {
  const url = import.meta.env.VITE_KEYCLOAK_URL;
  const realm = import.meta.env.VITE_KEYCLOAK_REALM;
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

  if (!url || !realm || !clientId) {
    // Allow local no-auth dev if desired (you can keep RequireAuth to block UI)
    console.warn("Keycloak env vars are missing. Set VITE_KEYCLOAK_URL/REALM/CLIENT_ID.");
  }

  return new Keycloak({
    url,
    realm,
    clientId,
  });
}
