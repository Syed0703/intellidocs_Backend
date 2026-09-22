import { useState, type ReactNode } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  Bot,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from "lucide-react";

import { logout } from "../api/auth";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await logout();

      if (response.ok) {
        onClose();

        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-64 shrink-0 flex-col
          bg-[#123C32] px-4 py-5 text-white
          transition-transform duration-200 ease-out

          lg:static lg:z-auto lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-lg font-semibold">IntelliDocs</h1>

              <p className="text-xs text-white/50">Knowledge workspace</p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          <SidebarItem
            icon={<Bot size={19} />}
            label="Ask AI"
            to="/ask"
            onClick={onClose}
          />

          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            label="Overview"
            to="/dashboard"
            onClick={onClose}
          />

          <SidebarItem
            icon={<FolderOpen size={19} />}
            label="Knowledge Bases"
            to="/knowledge-bases"
            onClick={onClose}
          />

          <SidebarItem
            icon={<Users size={19} />}
            label="Members"
            to="/members"
            onClick={onClose}
          />
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />

            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  to: string;
  onClick?: () => void;
};

function SidebarItem({ icon, label, to, onClick }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
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
