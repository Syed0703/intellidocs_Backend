package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.SearchRequest;
import com.syed.intellidocs.dto.response.RagResponse;
import com.syed.intellidocs.exception.RateLimitExceededException;
import com.syed.intellidocs.security.CustomUserDetails;
import com.syed.intellidocs.service.RagService;
import com.syed.intellidocs.service.RateLimitService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organizations/{organizationId}/ask")
public class RagController {
    private final RagService ragService;
    private final RateLimitService rateLimitService;

    public RagController(RagService ragService, RateLimitService rateLimitService) {
        this.ragService = ragService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping
    public RagResponse ask(
            @PathVariable Long organizationId,
            @Valid @RequestBody SearchRequest request
    ) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getUserId();

        if (!rateLimitService.allowAskRequest(userId)) {
            throw new RateLimitExceededException();
        }
        return ragService.ask(organizationId, request.getQuestion());
    }
}
