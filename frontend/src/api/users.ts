export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

export async function createUser(
  request: CreateUserRequest,
): Promise<Response> {
  const resposne = fetch("http://localhost:8080/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });
  return resposne;
}
