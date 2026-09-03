package com.syed.intellidocs.repository;

import com.syed.intellidocs.entity.DocumentChunk;
import com.syed.intellidocs.repository.projection.SearchResultProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    @Query(
            value = """
        SELECT
            dc.chunk_id AS chunkId,
            dc.content AS content,
            d.original_file_name AS documentName,
            kb.name AS knowledgeBaseName,
            dc.embedding <=> CAST(:queryEmbedding AS vector) AS distance
        FROM document_chunk dc
        JOIN document d
            ON dc.document_id = d.document_id
        JOIN knowledge_base kb
            ON d.knowledge_base_id = kb.knowledge_base_id
        WHERE kb.organization_id = :organizationId
          AND d.status = 'READY'
          AND dc.embedding IS NOT NULL
          AND (dc.embedding <=> CAST(:queryEmbedding AS vector)) <= :maxDistance
        ORDER BY distance
        LIMIT :limit
        """,
            nativeQuery = true
    )
    List<SearchResultProjection> findSimilarChunks(
            @Param("organizationId") Long organizationId,
            @Param("queryEmbedding") String queryEmbedding,
            @Param("maxDistance") double maxDistance,
            @Param("limit") int limit
    );

    void deleteByDocumentDocumentId(Long documentId);
}
