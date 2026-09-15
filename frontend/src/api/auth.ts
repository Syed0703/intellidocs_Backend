export async function login(email: string, password: string) {
  const response = await fetch(
    "http://localhost:8080/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  return response
}


export async function getCurrentUser() {
  const response = await fetch(
    "http://localhost:8080/api/auth/me",
    {
      method: "GET",
      credentials: "include",
    }
  )

  return response
}

export async function logout() {
    const response = await fetch(
        "http://localhost:8080/api/auth/logout",
        {
            method: "POST",
            credentials: "include",
        }
    )
    return response;
}