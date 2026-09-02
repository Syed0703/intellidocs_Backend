package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.SearchResultResponse;
import com.syed.intellidocs.entity.DocumentChunk;
import com.syed.intellidocs.repository.DocumentChunkRepository;
import com.syed.intellidocs.repository.projection.SearchResultProjection;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SemanticSearchService {
    private final EmbeddingModel embeddingModel;
    private final DocumentChunkRepository documentChunkRepository;
    private final OrganizationAccessService organizationAccessService;

    public SemanticSearchService(
            EmbeddingModel embeddingModel,
            DocumentChunkRepository documentChunkRepository,
            OrganizationAccessService organizationAccessService
    ) {
        this.embeddingModel = embeddingModel;
        this.documentChunkRepository = documentChunkRepository;
        this.organizationAccessService = organizationAccessService;
    }

    public List<SearchResultResponse> search(Long organizationId, String question) {

        organizationAccessService.getMembership(organizationId);

        float[] queryEmbedding = embeddingModel.embed(question);

        String vector = convertToVectorString(queryEmbedding);

        List<SearchResultProjection> chunks =
                documentChunkRepository.findSimilarChunks(
                        organizationId,
                        vector,
                        0.43,
                        3
                );

        List<SearchResultResponse> responses = new ArrayList<>();

        for (SearchResultProjection chunk : chunks) {

            SearchResultResponse response = new SearchResultResponse();

            response.setChunkId(chunk.getChunkId());
            response.setContent(chunk.getContent());
            response.setDocumentName(chunk.getDocumentName());
            response.setKnowledgeBaseName(chunk.getKnowledgeBaseName());
            response.setDistance(chunk.getDistance());
            responses.add(response);
        }

        return responses;
    }

    private String convertToVectorString(float[] queryEmbedding) {
        StringBuilder builder = new StringBuilder("[");

        for(int i = 0; i < queryEmbedding.length; i++) {
            builder.append(queryEmbedding[i]);
            if(i < queryEmbedding.length - 1) {
                builder.append(",");
            }
        }
        builder.append("]");
        return builder.toString();
    }
}
