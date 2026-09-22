import { useState } from "react";

import {
  Building2,
  ChevronDown,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { Organization } from "../api/organizations";
import type { CurrentUser } from "../api/auth";

type HeaderProps = {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  currentUser: CurrentUser | null;

  onOrganizationChange: (organization: Organization) => void;

  onMenuClick: () => void;
};

function Header({
  organizations,
  selectedOrganization,
  currentUser,
  onOrganizationChange,
  onMenuClick,
}: HeaderProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E5E5E0] bg-white px-4 sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#4D534F] transition hover:bg-[#F2F3F0] lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Workspace Icon */}
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#285C4D] sm:flex">
          <Building2 size={18} />
        </div>

        {/* Workspace Dropdown */}
        <div className="relative min-w-0">
          <p className="hidden text-[11px] font-medium uppercase tracking-wide text-[#8A8E8B] sm:block">
            Workspace
          </p>

          <button
            type="button"
            disabled={organizations.length === 0}
            onClick={() => setWorkspaceOpen((current) => !current)}
            className="mt-0.5 flex max-w-[150px] items-center gap-2 rounded-lg border border-[#E1E2DE] bg-white px-3 py-1.5 text-sm font-semibold text-[#303633] transition hover:bg-[#F8F9F7] disabled:cursor-not-allowed sm:max-w-[230px]"
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {selectedOrganization?.organizationName ?? "No organizations"}
            </span>

            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform ${
                workspaceOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {workspaceOpen && organizations.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#DFE1DC] bg-white p-1.5 shadow-lg">
              {organizations.map((organization) => {
                const isSelected =
                  organization.organizationId ===
                  selectedOrganization?.organizationId;

                return (
                  <button
                    key={organization.organizationId}
                    type="button"
                    onClick={() => {
                      onOrganizationChange(organization);

                      setWorkspaceOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-[#EEF3F0] font-medium text-[#285C4D]"
                        : "text-[#4D534F] hover:bg-[#F5F6F3]"
                    }`}
                  >
                    <span className="truncate">
                      {organization.organizationName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Organization Role */}
        {selectedOrganization && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-[#F3F6F4] px-3 py-1.5 text-xs font-medium text-[#486057] md:flex">
            <ShieldCheck size={14} />

            {selectedOrganization.role === "ADMIN" ? "Administrator" : "Member"}
          </div>
        )}

        {/* Current User */}
        <div className="hidden text-right lg:block">
          <p className="max-w-[170px] truncate text-sm font-medium text-[#303633]">
            {currentUser?.name ?? "Loading..."}
          </p>

          <p className="max-w-[190px] truncate text-xs text-[#8A8E8B]">
            {currentUser?.email ?? ""}
          </p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EC] text-[#285C4D]">
          <UserRound size={18} />
        </div>
      </div>
    </header>
  );
}

export default Header;
