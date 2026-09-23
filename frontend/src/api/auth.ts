import { apiFetch } from "./apiClient";

export type CurrentUser = {
  userId: number;
  name: string;
  email: string;
};

export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function getCurrentUser() {
  return apiFetch("/api/auth/me", {
    method: "GET",
  });
}

export async function logout() {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}
