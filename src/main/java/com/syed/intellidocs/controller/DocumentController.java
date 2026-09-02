package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.response.DocumentResponse;
import com.syed.intellidocs.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}/documents")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse uploadDocument(
            @PathVariable Long organizationId,
            @PathVariable Long knowledgeBaseId,
            @RequestParam("file") MultipartFile file
    ) {
        return documentService.uploadDocument(
                organizationId,
                knowledgeBaseId,
                file
        );
    }
}
