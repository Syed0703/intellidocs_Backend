package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.SearchRequest;
import com.syed.intellidocs.dto.response.SearchResultResponse;
import com.syed.intellidocs.service.SemanticSearchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations/{organizationId}/search")
public class SearchController {

    private final SemanticSearchService semanticSearchService;

    public SearchController(SemanticSearchService semanticSearchService) {
        this.semanticSearchService = semanticSearchService;
    }

    @PostMapping
    public List<SearchResultResponse> search(
            @PathVariable Long organizationId,
            @Valid @RequestBody SearchRequest request
    ) {
        return semanticSearchService.search(
                organizationId,
                request.getQuestion()
        );
    }
}