import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/stores", label: "Stores", icon: "🏢", superAdminOnly: true },
  { to: "/orders", label: "Orders", icon: "🧾" },
  { to: "/reshuffle", label: "Reshuffle", icon: "🔄" },
  { to: "/deliveries", label: "Deliveries", icon: "🚚" },
  { to: "/vendors", label: "Vendors", icon: "🏬" },
  { to: "/catalog", label: "Catalog", icon: "📦" },
  { to: "/staff", label: "Staff", icon: "👥", adminOnly: true },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/activity", label: "Activity", icon: "🕒" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const canSeeStaff = user?.role === "SUPERADMIN" || user?.role === "STORE_ADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const content = (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center font-extrabold">P</div>
        <div>
          <div className="font-extrabold text-slate-900 leading-tight">Purchase Portal</div>
          <div className="text-xs text-slate-400">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV.filter((n) => (!n.adminOnly || canSeeStaff) && (!n.superAdminOnly || isSuperAdmin)).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold mb-1 transition-colors ${
                isActive ? "bg-primary-bg text-primary" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <span>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-100 text-xs text-slate-400">
        Signed in as <span className="font-semibold text-slate-600">{user?.role}</span>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-slate-100">{content}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
}
