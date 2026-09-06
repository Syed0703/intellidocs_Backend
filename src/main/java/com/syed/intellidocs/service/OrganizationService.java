package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateOrganizationRequest;
import com.syed.intellidocs.dto.response.OrganizationResponse;
import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.enums.OrganizationStatus;
import com.syed.intellidocs.exception.UserNotFoundException;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.repository.OrganizationRepository;
import com.syed.intellidocs.repository.UserRepository;
import com.syed.intellidocs.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            MembershipRepository membershipRepository,
            UserRepository userRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();

        CustomUserDetails userDetails = (CustomUserDetails) authentication
                .getPrincipal();

        User currentUser = userRepository
                .findById(userDetails.getUserId())
                .orElseThrow(() -> new UserNotFoundException());


        Organization organization = new Organization();
        organization.setOrganizationName(request.getOrganizationName());
        organization.setStatus(OrganizationStatus.ACTIVE);

        Organization savedOrganization = organizationRepository.save(organization);

        Membership adminMembership = new Membership(
                MembershipRole.ADMIN,
                currentUser,
                savedOrganization
        );
        membershipRepository.save(adminMembership);

        OrganizationResponse response = new OrganizationResponse();
        response.setOrganizationId(savedOrganization.getOrganizationId());
        response.setOrganizationName(savedOrganization.getOrganizationName());
        response.setStatus(savedOrganization.getStatus());

        return response;
    }
}
