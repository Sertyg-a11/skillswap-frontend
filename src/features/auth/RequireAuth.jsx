import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import Spinner from "../../shared/ui/Spinner";

export default function RequireAuth({ children }) {
  const { ready, authenticated } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner label="Loading session..." />
      </div>
    );
  }

  if (!authenticated) {
    // Do NOT auto-login. Send them to homepage.
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
