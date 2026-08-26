package com.syed.intellidocs.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateKnowledgeBaseRequest {
    @NotBlank
    private String name;
    private String description;
}
