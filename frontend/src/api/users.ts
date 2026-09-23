import { apiFetch } from "./apiClient";

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

export async function createUser(
  request: CreateUserRequest,
): Promise<Response> {
  return apiFetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}
