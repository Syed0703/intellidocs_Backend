import { apiFetch } from "./apiClient";

export type Source = {
  documentName: string;
  knowledgeBaseName: string;
};

export type RagResponse = {
  answer: string;
  sources: Source[];
};

export async function askQuestion(
  organizationId: number,
  question: string,
): Promise<Response> {
  return apiFetch(`/api/organizations/${organizationId}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
    }),
  });
}
