package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.MembershipResponse;
import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.exception.MembershipAlreadyExistsException;
import com.syed.intellidocs.exception.OrganizationNotFoundException;
import com.syed.intellidocs.exception.UserNotFoundException;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.repository.OrganizationRepository;
import com.syed.intellidocs.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class MembershipService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;

    public MembershipService(UserRepository userRepository,
                             OrganizationRepository organizationRepository,
                             MembershipRepository membershipRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;

    }

    public MembershipResponse createMembership(Long userId, Long organizationId, MembershipRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException());

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException());

        boolean existingMembership = membershipRepository
                .existsByUserUserIdAndOrganizationOrganizationId(userId, organizationId);

        if(existingMembership) {
            throw new MembershipAlreadyExistsException();
        }

        Membership membership = new Membership(role, user, organization);
        Membership savedMembership = membershipRepository.save(membership);

        MembershipResponse response = new MembershipResponse();
        response.setMembershipId(savedMembership.getMembershipId());
        response.setRole(savedMembership.getRole());
        response.setUserId(savedMembership.getUser().getUserId());
        response.setUserName(savedMembership.getUser().getName());
        response.setUserEmail(savedMembership.getUser().getEmail());
        response.setOrganizationId(savedMembership.getOrganization().getOrganizationId());
        response.setOrganizationName(savedMembership.getOrganization().getOrganizationName());
        response.setJoinedAt(savedMembership.getJoinedAt());
        return response;
    }

}
