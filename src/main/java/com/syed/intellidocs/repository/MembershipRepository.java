package com.syed.intellidocs.repository;

import com.syed.intellidocs.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserUserIdAndOrganizationOrganizationId(Long userId, Long organizationId);
}
