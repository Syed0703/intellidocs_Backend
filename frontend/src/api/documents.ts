export type DocumentResponse = {
    documentId: number
    originalFileName: string
    contentType: string
    fileSize: number
    status: string
    knowledgeBaseId: number
    createdAt: string
}

export async function getDocuments(
    organizationId: number,
    knowledgeBaseId: number
): Promise<Response> {

    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents`,
        {
            method: "GET",
            credentials: "include"
        }
    )
    return response;
}


export async function uploadDocument(
    organizationId: number,
    knowledgeBaseId: number,
    file: File
): Promise<Response> {
    
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents`,
        {
            method: "POST",
            credentials: "include",
            body: formData
        }
    )
    return response;
}


export async function deleteDocument(
    organizationId: number, 
    knowledgeBaseId: number, 
    documentId: number
): Promise<Response> {
    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    )
    return response;
}