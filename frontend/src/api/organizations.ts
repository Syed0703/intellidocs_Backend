import { apiFetch } from "./apiClient";

export type Organization = {
  organizationId: number;
  organizationName: string;
  role: "ADMIN" | "MEMBER";
};

export type CreateOrganizationRequest = {
  organizationName: string;
};

export async function getOrganizations() {
  return apiFetch("/api/organizations", {
    method: "GET",
  });
}

export async function createOrganization(
  request: CreateOrganizationRequest,
) {
  return apiFetch("/api/organizations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}