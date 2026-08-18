import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/auth";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-slate-100 flex items-center gap-4 px-4 md:px-6">
      <button className="lg:hidden w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center" onClick={onMenuClick}>
        ☰
      </button>
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-appbg border border-slate-200 rounded-md px-3 py-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <span className="text-slate-400">🔍</span>
        <input className="bg-transparent outline-none text-sm w-full" placeholder="Search orders, vendors, products..." />
      </div>
      <div className="flex-1 sm:hidden" />
      <button className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500">
        🔔
        <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface">3</span>
      </button>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center"
        >
          {initials}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-slate-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-50">
              <div className="text-sm font-semibold text-slate-900">{user?.first_name || user?.username}</div>
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-bg">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
