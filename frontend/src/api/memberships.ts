export type Membership = {
  membershipId: number
  role: "ADMIN" | "MEMBER"
  userId: number
  userName: string
  userEmail: string
  organizationId: number
  organizationName: string
  joinedAt: string
}

export type CreateMembershipRequest = {
  email: string
  organizationId: number
  role: "ADMIN" | "MEMBER"
}

export type UpdateMembershipRoleRequest = {
    role: "ADMIN" | "MEMBER"
}


export async function getMemberships(organizationId: number): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/memberships/organization/${organizationId}`,
        {
            method: "GET",
            credentials: "include"
        }
    )
    return response;
}


export async function createMembership(request: CreateMembershipRequest): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/memberships`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(request)
        }
    )
    return response;
}


export async function deleteMembership(organizationId: number, membershipId: number): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/memberships/organization/${organizationId}/${membershipId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    )
    return response;
}


export async function updateMembershipRole(
    organizationId: number, 
    membershipId: number, 
    request: UpdateMembershipRoleRequest
): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/memberships/organization/${organizationId}/${membershipId}/role`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(request)
        }
    )
    return response;
}