package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.RagResponse;
import com.syed.intellidocs.dto.response.SearchResultResponse;
import com.syed.intellidocs.dto.response.SourceResponse;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RagService {
    private final SemanticSearchService semanticSearchService;
    private final ChatModel chatModel;

    public RagService(SemanticSearchService semanticSearchService, ChatModel chatModel) {
        this.semanticSearchService = semanticSearchService;
        this.chatModel = chatModel;
    }

    public RagResponse ask(Long organizationId, String question) {
        List<SearchResultResponse> results = semanticSearchService.search(
                organizationId,
                question
        );

        String noAnswerMessage = "I could not find that information in the uploaded documents.";


        if (results.isEmpty()) {

            RagResponse response = new RagResponse();
            response.setAnswer(noAnswerMessage);
            response.setSources(new ArrayList<>());

            return response;
        }

        StringBuilder context = new StringBuilder();
        for (SearchResultResponse result : results) {
            context.append(result.getContent());
            context.append("\n\n");
        }


        String prompt = """
        You are an assistant for IntelliDocs.

        Answer the user's question using only the provided context.

        If the answer cannot be found in the context, say exactly:
        "%s"

        Context:
        %s

        Question:
        %s
        """.formatted(
                noAnswerMessage,
                context.toString(),
                question
        );


        String answer =  chatModel.call(prompt);


        List<SourceResponse> sources = new ArrayList<>();

        if (!answer.trim().equals(noAnswerMessage)) {

            Set<String> addedSources = new HashSet<>();

            for (SearchResultResponse result : results) {

                String sourceKey =
                        result.getKnowledgeBaseName()
                                + "|"
                                + result.getDocumentName();

                if (!addedSources.contains(sourceKey)) {

                    SourceResponse source = new SourceResponse();

                    source.setDocumentName(
                            result.getDocumentName()
                    );

                    source.setKnowledgeBaseName(
                            result.getKnowledgeBaseName()
                    );

                    sources.add(source);
                    addedSources.add(sourceKey);
                }
            }
        }

        RagResponse response = new RagResponse();
        response.setAnswer(answer);
        response.setSources(sources);

        return response;
    }
}
