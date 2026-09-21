import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bot,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import { logout } from "../api/auth";

function Sidebar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await logout();

      if (response.ok) {
        navigate("/login", { replace: true });
      } else {
        console.error("Logout failed:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#123C32] px-4 py-5 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <FileText size={22} />
        </div>

        <div>
          <h1 className="text-lg font-semibold">IntelliDocs</h1>

          <p className="text-xs text-white/50">Knowledge workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        <SidebarItem icon={<Bot size={19} />} label="Ask AI" to="/ask" />

        <SidebarItem
          icon={<LayoutDashboard size={19} />}
          label="Overview"
          to="/dashboard"
        />

        <SidebarItem
          icon={<FolderOpen size={19} />}
          label="Knowledge Bases"
          to="/knowledge-bases"
        />

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
          <FileText size={19} />
          Documents
        </button>

        <SidebarItem icon={<Users size={19} />} label="Members" to="/members" />

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white">
          <Settings size={19} />
          Settings
        </button>
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut size={18} />

        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </aside>
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  to: string;
};

function SidebarItem({ icon, label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          isActive
            ? "bg-white/12 font-medium text-white"
            : "text-white/65 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export default Sidebar;
