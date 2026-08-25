package com.syed.intellidocs.service;

import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class OrganizationAccessService {

    private final MembershipRepository membershipRepository;

    public OrganizationAccessService(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    public Membership getMembership(Long organizationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getUserId();

        return membershipRepository
                .findByUserUserIdAndOrganizationOrganizationId(userId, organizationId)
                .orElseThrow(() ->
                        new AccessDeniedException("You do not have access to this organization")
                );
    }

    public void requireAdmin(Long organizationId) {
        Membership membership = getMembership(organizationId);
        if(membership.getRole() != MembershipRole.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
    }
}
