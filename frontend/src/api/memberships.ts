import { apiFetch } from "./apiClient";

export type Membership = {
  membershipId: number;
  role: "ADMIN" | "MEMBER";
  userId: number;
  userName: string;
  userEmail: string;
  organizationId: number;
  organizationName: string;
  joinedAt: string;
};

export type CreateMembershipRequest = {
  email: string;
  organizationId: number;
  role: "ADMIN" | "MEMBER";
};

export type UpdateMembershipRoleRequest = {
  role: "ADMIN" | "MEMBER";
};

export async function getMemberships(
  organizationId: number,
): Promise<Response> {
  return apiFetch(`/api/memberships/organization/${organizationId}`, {
    method: "GET",
  });
}

export async function createMembership(
  request: CreateMembershipRequest,
): Promise<Response> {
  return apiFetch("/api/memberships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export async function deleteMembership(
  organizationId: number,
  membershipId: number,
): Promise<Response> {
  return apiFetch(
    `/api/memberships/organization/${organizationId}/${membershipId}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateMembershipRole(
  organizationId: number,
  membershipId: number,
  request: UpdateMembershipRoleRequest,
): Promise<Response> {
  return apiFetch(
    `/api/memberships/organization/${organizationId}/${membershipId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}
