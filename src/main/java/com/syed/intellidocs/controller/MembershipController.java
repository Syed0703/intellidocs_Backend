package com.syed.intellidocs.controller;
import com.syed.intellidocs.dto.request.CreateMembershipRequest;
import com.syed.intellidocs.dto.response.MembershipResponse;
import com.syed.intellidocs.service.MembershipService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MembershipResponse createMembership(@RequestBody CreateMembershipRequest request) {
        return membershipService.createMembership(
                request.getUserId(),
                request.getOrganizationId(),
                request.getRole()
        );
    }

    @GetMapping("/organization/{organizationId}")
    public List<MembershipResponse> getMemberships(@PathVariable Long organizationId) {
        return membershipService.getMemberships(organizationId);
    }

    @DeleteMapping("/organization/{organizationId}/{membershipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMembership(
            @PathVariable Long organizationId,
            @PathVariable Long membershipId
    ) {
        membershipService.deleteMembership(
                organizationId,
                membershipId
        );
    }
}
