import { NavLink } from "react-router-dom";

export default function NavLinkItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-md text-sm transition",
          isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
