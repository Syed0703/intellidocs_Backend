package com.syed.intellidocs.repository;

import com.syed.intellidocs.entity.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    boolean existsByNameAndOrganizationOrganizationId(String name, Long organizationId);
    List<KnowledgeBase> findByOrganizationOrganizationId(Long organizationId);
}
