import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import Button from "../ui/Button";
import NavLinkItem from "./NavLinkItem";

export default function AppShell() {
  const { logout, profile } = useAuth();

  const who = profile?.preferred_username || profile?.email || profile?.sub;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/conversations" className="font-semibold text-slate-900">
              SkillSwap
            </Link>
            <nav className="hidden sm:flex text-sm text-slate-600 gap-1">
              <NavLinkItem to="/app/conversations">Home</NavLinkItem>
              <NavLinkItem to="/app/search">Search</NavLinkItem>
              <NavLinkItem to="/app/profile">Profile</NavLinkItem>
              <NavLinkItem to="/app/privacy">Privacy</NavLinkItem>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs text-slate-500 max-w-[260px] truncate">
              {who}
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="sm:hidden mb-4 flex gap-2 flex-wrap">
          <NavLinkItem to="/app/conversations">Home</NavLinkItem>
          <NavLinkItem to="/app/search">Search</NavLinkItem>
          <NavLinkItem to="/app/profile">Profile</NavLinkItem>
          <NavLinkItem to="/app/privacy">Privacy</NavLinkItem>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
