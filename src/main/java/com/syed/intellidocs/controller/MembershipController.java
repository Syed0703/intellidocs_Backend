package com.syed.intellidocs.controller;
import com.syed.intellidocs.dto.request.CreateMembershipRequest;
import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.service.MembershipService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Membership createMembership(@RequestBody CreateMembershipRequest request) {
        return membershipService.createMembership(
                request.getUserId(),
                request.getOrganizationId(),
                request.getRole()
        );
    }
}
