package com.syed.intellidocs.dto.response;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class KnowledgeBaseResponse {
    private Long knowledgeBaseId;
    private String name;
    private String description;
    private Long organizationId;
    private String organizationName;
    private LocalDateTime createdAt;
}
