import { useState, type FormEvent } from "react";

import {
  Building2,
  ChevronDown,
  Menu,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import type { Organization } from "../api/organizations";
import type { CurrentUser } from "../api/auth";

type HeaderProps = {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  currentUser: CurrentUser | null;

  onOrganizationChange: (organization: Organization) => void;

  onCreateOrganization: (organizationName: string) => Promise<void>;

  onMenuClick: () => void;
};

function Header({
  organizations,
  selectedOrganization,
  currentUser,
  onOrganizationChange,
  onCreateOrganization,
  onMenuClick,
}: HeaderProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [organizationName, setOrganizationName] = useState("");

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  const handleOpenCreateModal = () => {
    setWorkspaceOpen(false);
    setCreateError("");
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (creating) return;

    setCreateModalOpen(false);
    setOrganizationName("");
    setCreateError("");
  };

  const handleCreateOrganization = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = organizationName.trim();

    if (!name) return;

    setCreating(true);
    setCreateError("");

    try {
      await onCreateOrganization(name);

      setOrganizationName("");
      setCreateModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setCreateError(error.message);
      } else {
        setCreateError("Unable to create organization");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
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
              onClick={() => setWorkspaceOpen((current) => !current)}
              className="mt-0.5 flex max-w-[150px] items-center gap-2 rounded-lg border border-[#E1E2DE] bg-white px-3 py-1.5 text-sm font-semibold text-[#303633] transition hover:bg-[#F8F9F7] sm:max-w-[230px]"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {selectedOrganization?.organizationName ?? "Select workspace"}
              </span>

              <ChevronDown
                size={15}
                className={`shrink-0 transition-transform ${
                  workspaceOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {workspaceOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#DFE1DC] bg-white p-1.5 shadow-lg">
                {organizations.length > 0 ? (
                  organizations.map((organization) => {
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
                  })
                ) : (
                  <div className="px-3 py-3">
                    <p className="text-sm font-medium text-[#303633]">
                      No organizations yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8A8E8B]">
                      Create your first workspace to start adding knowledge.
                    </p>
                  </div>
                )}

                <div className="my-1 border-t border-[#ECEDE9]" />

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#285C4D] transition hover:bg-[#EEF3F0]"
                >
                  <Plus size={16} />
                  Create organization
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {selectedOrganization && (
            <div className="hidden items-center gap-1.5 rounded-lg bg-[#F3F6F4] px-3 py-1.5 text-xs font-medium text-[#486057] md:flex">
              <ShieldCheck size={14} />

              {selectedOrganization.role === "ADMIN"
                ? "Administrator"
                : "Member"}
            </div>
          )}

          <div className="hidden text-right lg:block">
            <p className="max-w-[170px] truncate text-sm font-medium text-[#303633]">
              {currentUser?.name ?? "Loading..."}
            </p>

            <p className="max-w-[190px] truncate text-xs text-[#8A8E8B]">
              {currentUser?.email ?? ""}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EC] text-[#285C4D]">
            <UserRound size={18} />
          </div>
        </div>
      </header>

      {/* Create Organization Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#DFE1DC] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ECEDE9] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#202422]">
                  Create organization
                </h2>

                <p className="mt-1 text-sm text-[#707571]">
                  Create a workspace for your documents and team.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={creating}
                aria-label="Close"
                className="rounded-lg p-2 text-[#707571] transition hover:bg-[#F2F3F0]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="p-6">
              <label className="block text-sm font-medium text-[#303633]">
                Organization name
              </label>

              <input
                type="text"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="e.g. IntelliDocs Demo"
                autoFocus
                className="mt-2 w-full rounded-lg border border-[#D8DCD7] bg-white px-3 py-2.5 text-sm text-[#202422] outline-none transition placeholder:text-[#A1A5A2] focus:border-[#285C4D]"
              />

              {createError && (
                <p className="mt-3 text-sm text-red-600">{createError}</p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={creating}
                  className="rounded-lg border border-[#D8DCD7] px-4 py-2 text-sm font-medium text-[#4B514D] transition hover:bg-[#F6F7F4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || !organizationName.trim()}
                  className="rounded-lg bg-[#285C4D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
