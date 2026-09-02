package com.syed.intellidocs.repository.projection;

public interface SearchResultProjection {

    Long getChunkId();

    String getContent();

    String getDocumentName();

    String getKnowledgeBaseName();

    Double getDistance();
}
