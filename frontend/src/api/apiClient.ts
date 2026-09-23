const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type CsrfResponse = {
  token: string;
  headerName: string;
  parameterName: string;
};

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to obtain CSRF token");
  }

  const data: CsrfResponse = await response.json();

  csrfToken = data.token;

  return csrfToken;
}

function requiresCsrf(method: string) {
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method.toUpperCase());
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (requiresCsrf(method)) {
    const token = await getCsrfToken();

    headers.set("X-XSRF-TOKEN", token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  // Login/logout may cause the server-side
  // CSRF state to change. Force a fresh token
  // for the next modifying request.
  if (path === "/api/auth/login" || path === "/api/auth/logout") {
    csrfToken = null;
  }

  return response;
}
