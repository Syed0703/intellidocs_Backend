package com.syed.intellidocs.repository;

import com.syed.intellidocs.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    boolean existsByOriginalFileNameAndKnowledgeKnowledgeBaseId(
            String originalFileName,
            Long KnowledgeBaseId
    );
}
