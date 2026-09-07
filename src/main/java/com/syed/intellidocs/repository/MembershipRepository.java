package com.syed.intellidocs.repository;

import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.enums.MembershipRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    boolean existsByUserUserIdAndOrganizationOrganizationId(
            Long userId,
            Long organizationId
    );

    Optional<Membership> findByUserUserIdAndOrganizationOrganizationId(
            Long userId,
            Long organizationId
    );

    List<Membership> findByOrganizationOrganizationId(Long organizationId);

    Optional<Membership> findByMembershipIdAndOrganizationOrganizationId(
            Long membershipId,
            Long organizationId
    );

    long countByOrganizationOrganizationIdAndRole(
            Long organizationId,
            MembershipRole role
    );

    List<Membership> findByUserUserId(Long userId);
}
