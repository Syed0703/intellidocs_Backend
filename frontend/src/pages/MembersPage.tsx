import { useEffect, useState, type FormEvent } from "react";

import { useOutletContext } from "react-router-dom";

import {
  LoaderCircle,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import type { Organization } from "../api/organizations";

import {
  createMembership,
  deleteMembership,
  getMemberships,
  updateMembershipRole,
  type Membership,
} from "../api/memberships";

function MembersPage() {
  const selectedOrganization = useOutletContext<Organization | null>();

  const [memberships, setMemberships] = useState<Membership[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // ADD MEMBER
  // =========================

  const [showAddMember, setShowAddMember] = useState(false);

  const [email, setEmail] = useState("");

  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const [creating, setCreating] = useState(false);

  const [createError, setCreateError] = useState("");

  // =========================
  // ROLE UPDATE
  // =========================

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [actionError, setActionError] = useState("");

  // =========================
  // DELETE
  // =========================

  const [memberToDelete, setMemberToDelete] = useState<Membership | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const isAdmin = selectedOrganization?.role === "ADMIN";

  // =========================
  // LOAD MEMBERS
  // =========================

  useEffect(() => {
    if (!selectedOrganization) return;

    const loadMemberships = async () => {
      setLoading(true);
      setError("");
      setMemberships([]);
      setActionError("");

      try {
        const response = await getMemberships(
          selectedOrganization.organizationId,
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          setError(data?.message || "Unable to load members");

          return;
        }

        const data: Membership[] = await response.json();

        setMemberships(data);
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    setSearch("");
    setShowAddMember(false);
    setMemberToDelete(null);

    loadMemberships();
  }, [selectedOrganization]);

  // =========================
  // SEARCH MEMBERS
  // =========================

  const filteredMemberships = memberships.filter((membership) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const roleText =
      membership.role === "ADMIN" ? "admin administrator" : "member";

    return (
      membership.userName.toLowerCase().includes(query) ||
      membership.userEmail.toLowerCase().includes(query) ||
      roleText.includes(query)
    );
  });

  // =========================
  // ADD MEMBER
  // =========================

  const handleCreateMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOrganization || !email.trim()) {
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const response = await createMembership({
        email: email.trim(),
        organizationId: selectedOrganization.organizationId,
        role,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setCreateError(data?.message || "Unable to add member");

        return;
      }

      const newMembership: Membership = await response.json();

      setMemberships((current) => [...current, newMembership]);

      setEmail("");
      setRole("MEMBER");
      setShowAddMember(false);
    } catch {
      setCreateError("Unable to connect to the server");
    } finally {
      setCreating(false);
    }
  };

  const handleCloseAddMember = () => {
    if (creating) return;

    setShowAddMember(false);
    setEmail("");
    setRole("MEMBER");
    setCreateError("");
  };

  // =========================
  // ROLE UPDATE
  // =========================

  const handleRoleChange = async (
    membershipId: number,
    newRole: "ADMIN" | "MEMBER",
  ) => {
    if (!selectedOrganization) return;

    setUpdatingId(membershipId);
    setActionError("");

    try {
      const response = await updateMembershipRole(
        selectedOrganization.organizationId,
        membershipId,
        {
          role: newRole,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setActionError(data?.message || "Unable to update member role");

        return;
      }

      const updatedMembership: Membership = await response.json();

      setMemberships((current) =>
        current.map((membership) =>
          membership.membershipId === membershipId
            ? updatedMembership
            : membership,
        ),
      );
    } catch {
      setActionError("Unable to connect to the server");
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================

  const openDeleteModal = (membership: Membership) => {
    setMemberToDelete(membership);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deletingId !== null) return;

    setMemberToDelete(null);
    setDeleteError("");
  };

  const handleDeleteMember = async () => {
    if (!selectedOrganization || !memberToDelete) {
      return;
    }

    setDeletingId(memberToDelete.membershipId);

    setDeleteError("");

    try {
      const response = await deleteMembership(
        selectedOrganization.organizationId,
        memberToDelete.membershipId,
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setDeleteError(data?.message || "Unable to remove member");

        return;
      }

      setMemberships((current) =>
        current.filter(
          (membership) =>
            membership.membershipId !== memberToDelete.membershipId,
        ),
      );

      setMemberToDelete(null);
    } catch {
      setDeleteError("Unable to connect to the server");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">Members</h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#707571]">
            View people with access to this organization and manage their roles.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D] sm:w-fit"
          >
            <Plus size={17} />
            Add Member
          </button>
        )}
      </div>

      {/* ================= SUMMARY ================= */}

      {!loading && !error && selectedOrganization && (
        <div className="mt-7 flex min-w-0 items-center gap-3 rounded-xl border border-[#DFE1DC] bg-white px-4 py-4 sm:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
            <Users size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#202422]">
              {memberships.length}{" "}
              {memberships.length === 1 ? "member" : "members"}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#7A807C]">
              in {selectedOrganization.organizationName}
            </p>
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}

      {!loading && !error && memberships.length > 0 && (
        <div className="mt-6">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F8B]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
            />
          </div>
        </div>
      )}

      {/* ================= ACTION ERROR ================= */}

      {actionError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex h-[92px] animate-pulse items-center rounded-xl border border-[#DFE1DC] bg-white px-5"
            >
              <div className="h-10 w-10 rounded-full bg-[#ECEEEA]" />

              <div className="ml-4 flex-1">
                <div className="h-4 w-36 rounded bg-[#ECEEEA]" />

                <div className="mt-2 h-3 w-48 max-w-full rounded bg-[#F0F1EE]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ERROR ================= */}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading && !error && memberships.length === 0 && (
        <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CED2CD] bg-white px-5 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1ED] text-[#285C4D]">
            <Users size={25} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#202422]">
            No members yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[#707571]">
            Add existing IntelliDocs users to collaborate within this
            organization.
          </p>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white sm:w-fit"
            >
              <Plus size={17} />
              Add Member
            </button>
          )}
        </div>
      )}

      {/* ================= NO SEARCH RESULTS ================= */}

      {!loading &&
        !error &&
        memberships.length > 0 &&
        filteredMemberships.length === 0 && (
          <div className="mt-6 rounded-xl border border-[#DFE1DC] bg-white px-5 py-10 text-center">
            <Search size={23} className="mx-auto text-[#A0A5A1]" />

            <p className="mt-3 font-medium text-[#202422]">
              No matching members
            </p>

            <p className="mt-2 text-sm text-[#707571]">
              Try searching by name, email, or role.
            </p>
          </div>
        )}

      {/* ================= MEMBER LIST ================= */}

      {!loading && !error && filteredMemberships.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#DFE1DC] bg-white">
          {/* Desktop Header */}
          <div className="hidden border-b border-[#ECEDE9] bg-[#FAFAF8] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#8A8F8B] md:grid md:grid-cols-[minmax(0,1fr)_180px_110px] md:items-center">
            <span>Member</span>
            <span>Role</span>

            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#ECEDE9]">
            {filteredMemberships.map((membership) => (
              <div
                key={membership.membershipId}
                className="flex flex-col justify-between gap-4 px-4 py-4 transition hover:bg-[#FAFAF8] sm:px-5 md:grid md:grid-cols-[minmax(0,1fr)_180px_110px] md:items-center"
              >
                {/* User */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF3F0] text-[#285C4D]">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#202422]">
                      {membership.userName}
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#7B817D]">
                      <Mail size={12} className="shrink-0" />

                      <span className="truncate">{membership.userEmail}</span>
                    </div>

                    <p className="mt-1 text-[11px] text-[#9A9E9B]">
                      Joined{" "}
                      {new Date(membership.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  {isAdmin ? (
                    <div className="relative w-fit">
                      <select
                        value={membership.role}
                        disabled={updatingId === membership.membershipId}
                        onChange={(event) =>
                          handleRoleChange(
                            membership.membershipId,
                            event.target.value as "ADMIN" | "MEMBER",
                          )
                        }
                        className="min-w-[125px] rounded-lg border border-[#D8DCD7] bg-white px-3 py-2 text-sm text-[#202422] outline-none transition focus:border-[#285C4D] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="MEMBER">Member</option>

                        <option value="ADMIN">Administrator</option>
                      </select>

                      {updatingId === membership.membershipId && (
                        <LoaderCircle
                          size={14}
                          className="absolute -right-6 top-2.5 animate-spin text-[#285C4D]"
                        />
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3F0] px-3 py-1.5 text-xs font-medium text-[#486057]">
                      {membership.role === "ADMIN" ? (
                        <ShieldCheck size={13} />
                      ) : (
                        <UserRound size={13} />
                      )}

                      {membership.role === "ADMIN" ? "Administrator" : "Member"}
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="flex justify-start md:justify-end">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => openDeleteModal(membership)}
                      disabled={deletingId === membership.membershipId}
                      aria-label={`Remove ${membership.userName}`}
                      title="Remove member"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A8F8B] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  ) : (
                    <span className="text-xs text-[#A0A4A1]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ADD MEMBER MODAL ================= */}

      {isAdmin && showAddMember && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-4 sm:items-center">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#DFE1DC] bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#202422]">
                  Add Member
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#707571]">
                  Add an existing IntelliDocs user to this organization.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAddMember}
                disabled={creating}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 text-[#707571] transition hover:bg-[#F3F4F1]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="member-email"
                  className="mb-2 block text-sm font-medium text-[#303633]"
                >
                  Email
                </label>

                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="employee@company.com"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm text-[#202422] outline-none transition focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="member-role"
                  className="mb-2 block text-sm font-medium text-[#303633]"
                >
                  Role
                </label>

                <select
                  id="member-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as "ADMIN" | "MEMBER")
                  }
                  className="w-full rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm text-[#202422] outline-none focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                >
                  <option value="MEMBER">Member</option>

                  <option value="ADMIN">Administrator</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-[#8A8F8B]">
                  Administrators can manage knowledge bases, documents, and
                  organization members.
                </p>
              </div>

              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseAddMember}
                  disabled={creating}
                  className="w-full rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium text-[#4B514D] sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {creating && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}

                  {creating ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}

      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-4 sm:items-center">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#DFE1DC] bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                aria-label="Close"
                className="rounded-lg p-2 text-[#8A8F8B] transition hover:bg-[#F3F4F1]"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#202422]">
              Remove member?
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-[#707571]">
              Are you sure you want to remove{" "}
              <span className="font-medium text-[#202422]">
                {memberToDelete.userName}
              </span>{" "}
              from this organization?
            </p>

            <p className="mt-1 break-all text-xs text-[#8A8F8B]">
              {memberToDelete.userEmail}
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={closeDeleteModal}
                className="w-full rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium text-[#4B514D] sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={handleDeleteMember}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deletingId !== null && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}

                {deletingId !== null ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;
