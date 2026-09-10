package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.SearchRequest;
import com.syed.intellidocs.dto.response.SearchResultResponse;
import com.syed.intellidocs.exception.RateLimitExceededException;
import com.syed.intellidocs.security.CustomUserDetails;
import com.syed.intellidocs.service.RateLimitService;
import com.syed.intellidocs.service.SemanticSearchService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations/{organizationId}/search")
public class SearchController {

    private final SemanticSearchService semanticSearchService;
    private final RateLimitService rateLimitService;

    public SearchController(
            SemanticSearchService semanticSearchService,
            RateLimitService rateLimitService
    ) {
        this.semanticSearchService = semanticSearchService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping
    public List<SearchResultResponse> search(
            @PathVariable Long organizationId,
            @Valid @RequestBody SearchRequest request
    ) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getUserId();

        if (!rateLimitService.allowSearchRequest(userId)) {
            throw new RateLimitExceededException();
        }
        return semanticSearchService.search(
                organizationId,
                request.getQuestion()
        );
    }
}