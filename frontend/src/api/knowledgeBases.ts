import { apiFetch } from "./apiClient";

export type KnowledgeBase = {
  knowledgeBaseId: number;
  name: string;
  description: string | null;
  organizationId: number;
  organizationName: string;
  createdAt: string;
};

export type CreateKnowledgeBaseRequest = {
  name: string;
  description: string | null;
};

export type UpdateKnowledgeBaseRequest = {
  name: string;
  description: string | null;
};

export async function getKnowledgeBases(
  organizationId: number,
): Promise<Response> {
  return apiFetch(`/api/organizations/${organizationId}/knowledge-bases`, {
    method: "GET",
  });
}

export async function createKnowledgeBase(
  organizationId: number,
  request: CreateKnowledgeBaseRequest,
): Promise<Response> {
  return apiFetch(`/api/organizations/${organizationId}/knowledge-bases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export async function updateKnowledgeBase(
  organizationId: number,
  knowledgeBaseId: number,
  request: UpdateKnowledgeBaseRequest,
): Promise<Response> {
  return apiFetch(
    `/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
}

export async function deleteKnowledgeBase(
  organizationId: number,
  knowledgeBaseId: number,
): Promise<Response> {
  return apiFetch(
    `/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}`,
    {
      method: "DELETE",
    },
  );
}
