import { useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import type { Organization } from "../api/organizations";
import {
  createMembership,
  getMemberships,
  updateMembershipRole,
  deleteMembership,
  type Membership,
} from "../api/memberships";

function MembersPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Membership | null>(null);

  const selectedOrganization = useOutletContext<Organization | null>();

  const isAdmin = selectedOrganization?.role === "ADMIN";

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
        { role: newRole },
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

  const handleDeleteMember = async (membershipId: number) => {
    if (!selectedOrganization) return;

    setDeletingId(membershipId);
    setActionError("");

    try {
      const response = await deleteMembership(
        selectedOrganization.organizationId,
        membershipId,
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setActionError(data?.message || "Unable to remove member");

        return;
      }

      setMemberships((current) =>
        current.filter(
          (membership) => membership.membershipId !== membershipId,
        ),
      );

      setMemberToDelete(null);
    } catch {
      setActionError("Unable to connect to the server");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!selectedOrganization) return;

    const loadMemberships = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMemberships(
          selectedOrganization.organizationId,
        );

        if (!response.ok) {
          setError("Unable to load members");
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

    loadMemberships();
  }, [selectedOrganization]);

  const handleCreateMember = async (event: FormEvent) => {
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

  const handleCancel = () => {
    setShowAddMember(false);
    setEmail("");
    setRole("MEMBER");
    setCreateError("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">Members</h1>

          <p className="mt-2 text-sm text-[#707571]">
            View and manage members of your organization.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="rounded-lg bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D]"
          >
            Add Member
          </button>
        )}
      </div>

      {/* Add Member Form */}
      {isAdmin && showAddMember && (
        <form
          onSubmit={handleCreateMember}
          className="mb-6 rounded-xl border border-[#DFE1DC] bg-white p-5"
        >
          <h2 className="text-base font-semibold text-[#202422]">Add Member</h2>

          <p className="mt-1 text-sm text-[#707571]">
            Add an existing IntelliDocs user to this organization.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="member-email"
                className="mb-2 block text-sm font-medium text-[#363B38]"
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
                className="w-full rounded-lg border border-[#D8DCD7] px-3 py-2.5 text-sm text-[#202422] outline-none transition focus:border-[#285C4D]"
              />
            </div>

            <div>
              <label
                htmlFor="member-role"
                className="mb-2 block text-sm font-medium text-[#363B38]"
              >
                Role
              </label>

              <select
                id="member-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "ADMIN" | "MEMBER")
                }
                className="w-full rounded-lg border border-[#D8DCD7] bg-white px-3 py-2.5 text-sm text-[#202422] outline-none transition focus:border-[#285C4D]"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {createError && (
            <p className="mt-4 text-sm text-red-600">{createError}</p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={creating}
              className="rounded-lg border border-[#D8DCD7] px-4 py-2 text-sm font-medium text-[#4B514D] hover:bg-[#F6F7F4]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating || !email.trim()}
              className="rounded-lg bg-[#285C4D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {actionError && (
        <p className="mb-4 text-sm text-red-600">{actionError}</p>
      )}

      {/* Loading */}
      {loading && <p className="text-sm text-[#707571]">Loading members...</p>}

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Empty */}
      {!loading && !error && memberships.length === 0 && (
        <div className="rounded-xl border border-[#DFE1DC] bg-white p-8 text-center">
          <p className="font-medium text-[#202422]">No members found</p>

          <p className="mt-1 text-sm text-[#707571]">
            This organization does not have any members yet.
          </p>
        </div>
      )}

      {/* Member List */}
      {!loading && !error && memberships.length > 0 && (
        <div className="space-y-3">
          {memberships.map((membership) => (
            <div
              key={membership.membershipId}
              className="flex items-center justify-between rounded-xl border border-[#DFE1DC] bg-white p-4"
            >
              <div>
                <p className="font-medium text-[#202422]">
                  {membership.userName}
                </p>

                <p className="mt-1 text-sm text-[#707571]">
                  {membership.userEmail}
                </p>

                <p className="mt-2 text-xs text-[#8A8F8B]">
                  Joined {new Date(membership.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <select
                    value={membership.role}
                    disabled={updatingId === membership.membershipId}
                    onChange={(event) =>
                      handleRoleChange(
                        membership.membershipId,
                        event.target.value as "ADMIN" | "MEMBER",
                      )
                    }
                    className="rounded-lg border border-[#D8DCD7] bg-white px-3 py-2 text-sm text-[#202422]"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span className="rounded-full bg-[#F1F2EF] px-3 py-1 text-xs font-medium text-[#606662]">
                    {membership.role}
                  </span>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    disabled={deletingId === membership.membershipId}
                    onClick={() => setMemberToDelete(membership)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === membership.membershipId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ✅ Custom delete confirmation modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#DFE1DC] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[#202422]">
              Remove member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#707571]">
              Are you sure you want to remove{" "}
              <span className="font-medium text-[#202422]">
                {memberToDelete.userEmail}
              </span>{" "}
              from this organization?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => setMemberToDelete(null)}
                className="rounded-lg border border-[#D8DCD7] px-4 py-2 text-sm font-medium text-[#4B514D] transition hover:bg-[#F6F7F4]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => handleDeleteMember(memberToDelete.membershipId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === memberToDelete.membershipId
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;
