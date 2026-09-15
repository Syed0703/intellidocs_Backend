export type Organization = {
  organizationId: number
  organizationName: string
  role: "ADMIN" | "MEMBER"
}

export async function getOrganizations() {
  const response = await fetch(
    "http://localhost:8080/api/organizations",
    {
      method: "GET",
      credentials: "include",
    }
  )

  return response
}