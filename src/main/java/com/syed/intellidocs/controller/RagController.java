package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.SearchRequest;
import com.syed.intellidocs.dto.response.RagResponse;
import com.syed.intellidocs.service.RagService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organizations/{organizationId}/ask")
public class RagController {
    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping
    public RagResponse ask(
            @PathVariable Long organizationId,
            @Valid @RequestBody SearchRequest request
    ) {
        return ragService.ask(organizationId, request.getQuestion());
    }
}
