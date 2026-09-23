import { apiFetch } from "./apiClient";

export type DocumentResponse = {
  documentId: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  status: string;
  knowledgeBaseId: number;
  createdAt: string;
};

export async function getDocuments(
  organizationId: number,
  knowledgeBaseId: number,
): Promise<Response> {
  return apiFetch(
    `/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents`,
    {
      method: "GET",
    },
  );
}

export async function uploadDocument(
  organizationId: number,
  knowledgeBaseId: number,
  file: File,
): Promise<Response> {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch(
    `/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function deleteDocument(
  organizationId: number,
  knowledgeBaseId: number,
  documentId: number,
): Promise<Response> {
  return apiFetch(
    `/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );
}
