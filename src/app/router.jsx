import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "../features/auth/RequireAuth";
import LoginPage from "../features/auth/LoginPage";
import AppShell from "../shared/layout/AppShell";

import HomePage from "../features/homepage/HomePage";
import ConversationsPage from "../features/conversations/ConversationsPage";
import SearchPage from "../features/search/SearchPage";
import ProfilePage from "../features/users/ProfilePage";
import PrivacyPage from "../features/users/PrivacyPage";

export const router = createBrowserRouter([
  // Public landing page
  { path: "/", element: <HomePage /> },

  // Optional explicit login route (if you keep it)
  { path: "/login", element: <LoginPage /> },

  // Protected app
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/conversations" replace /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
