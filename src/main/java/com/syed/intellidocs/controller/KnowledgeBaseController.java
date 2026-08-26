package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.CreateKnowledgeBaseRequest;
import com.syed.intellidocs.dto.response.KnowledgeBaseResponse;
import com.syed.intellidocs.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations/{organizationId}/knowledge-bases")
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    public KnowledgeBaseController(KnowledgeBaseService knowledgeBaseService) {
        this.knowledgeBaseService = knowledgeBaseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeBaseResponse createKnowledgeBase(
            @PathVariable Long organizationId,
            @Valid @RequestBody CreateKnowledgeBaseRequest request
    ) {
        return knowledgeBaseService.createKnowledgeBase(organizationId, request);
    }

    @GetMapping
    public List<KnowledgeBaseResponse> getKnowledgeBases(@PathVariable Long organizationId) {
        return knowledgeBaseService.getKnowledgeBases(organizationId);
    }
}
