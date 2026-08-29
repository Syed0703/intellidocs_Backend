package com.syed.intellidocs.dto.response;

import com.syed.intellidocs.enums.DocumentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DocumentResponse {
    private Long documentId;
    private String originalFileName;
    private String contentType;
    private long fileSize;
    private DocumentStatus status;
    private Long knowledgeBaseId;
    private LocalDateTime createdAt;
}
