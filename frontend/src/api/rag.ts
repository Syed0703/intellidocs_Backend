export type Source = {
    documentName: string
    knowledgeBaseName: string
}

export type RagResponse = {
    answer: string
    sources: Source[]
}

export async function askQuestion(organizationId: number, question: string) {
    const response = await fetch(
        `http://localhost:8080/api/organizations/${organizationId}/ask`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                question: question,
            }),
        }
    )
    return response;
}