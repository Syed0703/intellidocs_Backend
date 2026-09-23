import { apiFetch } from "./apiClient";

export type Organization = {
  organizationId: number;
  organizationName: string;
  role: "ADMIN" | "MEMBER";
};

export async function getOrganizations() {
  return apiFetch("/api/organizations", {
    method: "GET",
  });
}
