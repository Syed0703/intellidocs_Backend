export type KnowledgeBase = {
  knowledgeBaseId: number
  name: string
  description: string | null
  organizationId: number
  organizationName: string
  createdAt: string
}

export type CreateKnowledgeBaseRequest = {
  name: string
  description: string | null
}

export type UpdateKnowledgeBaseRequest = {
  name: string
  description: string | null
}

export async function getKnowledgeBases(organizationId: number): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases`,
        {
            method: "GET",
            credentials: "include"
        }
    )
    return response;
}

export async function createKnowledgeBase(
    organizationId: number, 
    request: CreateKnowledgeBaseRequest
): Promise<Response> {
    
    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases`,
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

export async function updateKnowledgeBase(
  organizationId: number,
  knowledgeBaseId: number,
  request: UpdateKnowledgeBaseRequest
): Promise<Response> {
  return fetch(
    `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    }
  )
}

export async function deleteKnowledgeBase(
  organizationId: number,
  knowledgeBaseId: number
): Promise<Response> {
  return fetch(
    `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )
}