package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.MembershipResponse;
import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.exception.*;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.repository.OrganizationRepository;
import com.syed.intellidocs.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MembershipService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final OrganizationAccessService organizationAccessService;

    public MembershipService(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            MembershipRepository membershipRepository,
            OrganizationAccessService organizationAccessService
    ) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.organizationAccessService = organizationAccessService;
    }

    public MembershipResponse createMembership(
            Long userId,
            Long organizationId,
            MembershipRole role
    ) {
        organizationAccessService.requireAdmin(organizationId);

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


    public List<MembershipResponse> getMemberships(Long organizationId) {

        organizationAccessService.requireAdmin(organizationId);

        List<Membership> memberships =
                membershipRepository.findByOrganizationOrganizationId(
                        organizationId
                );

        List<MembershipResponse> responses = new ArrayList<>();

        for (Membership membership : memberships) {

            MembershipResponse response = new MembershipResponse();

            response.setMembershipId(membership.getMembershipId());
            response.setRole(membership.getRole());
            response.setUserId(membership.getUser().getUserId());
            response.setUserName(membership.getUser().getName());
            response.setUserEmail(membership.getUser().getEmail());
            response.setOrganizationId(
                    membership.getOrganization().getOrganizationId()
            );
            response.setOrganizationName(
                    membership.getOrganization().getOrganizationName()
            );
            response.setJoinedAt(membership.getJoinedAt());

            responses.add(response);
        }

        return responses;
    }


    @Transactional
    public void deleteMembership(
            Long organizationId,
            Long membershipId
    ) {
        organizationAccessService.requireAdmin(organizationId);

        Membership membership = membershipRepository
                .findByMembershipIdAndOrganizationOrganizationId(
                        membershipId,
                        organizationId
                ).orElseThrow(() -> new MembershipNotFoundException());

        if(membership.getRole() == MembershipRole.ADMIN) {
            long adminCount = membershipRepository
                    .countByOrganizationOrganizationIdAndRole(
                            organizationId,
                            MembershipRole.ADMIN
                    );

            if(adminCount <= 1) {
                throw new LastAdminRemovalException();
            }
        }
        membershipRepository.delete(membership);
    }


    public MembershipResponse updateMembershipRole(
            Long organizationId,
            Long membershipId,
            MembershipRole newRole
    ) {
        organizationAccessService.requireAdmin(organizationId);

        Membership membership = membershipRepository
                .findByMembershipIdAndOrganizationOrganizationId(
                        membershipId,
                        organizationId
                ).orElseThrow(() -> new MembershipNotFoundException());

        if(membership.getRole() == MembershipRole.ADMIN && newRole == MembershipRole.MEMBER) {
            long adminCount = membershipRepository
                    .countByOrganizationOrganizationIdAndRole(
                            organizationId,
                            MembershipRole.ADMIN
                    );

            if(adminCount <= 1) {
                throw new LastAdminRemovalException();
            }
        }

        membership.setRole(newRole);

        Membership savedMembership = membershipRepository.save(membership);

        MembershipResponse response = new MembershipResponse();
        response.setMembershipId(savedMembership.getMembershipId());
        response.setRole(savedMembership.getRole());
        response.setUserId(savedMembership.getUser().getUserId());
        response.setUserName(savedMembership.getUser().getName());
        response.setUserEmail(savedMembership.getUser().getEmail());
        response.setOrganizationId(
                savedMembership.getOrganization().getOrganizationId()
        );
        response.setOrganizationName(
                savedMembership.getOrganization().getOrganizationName()
        );
        response.setJoinedAt(savedMembership.getJoinedAt());

        return response;

    }

}
