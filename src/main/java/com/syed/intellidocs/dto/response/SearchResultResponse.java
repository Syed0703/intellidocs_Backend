package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchResultResponse {
    private Long chunkId;
    private String content;
    private String documentName;
    private String knowledgeBaseName;
    private Double distance;
}
