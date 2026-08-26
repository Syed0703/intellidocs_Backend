package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateKnowledgeBaseRequest;
import com.syed.intellidocs.dto.response.KnowledgeBaseResponse;
import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.exception.KnowledgeBaseAlreadyExistsException;
import com.syed.intellidocs.exception.OrganizationNotFoundException;
import com.syed.intellidocs.repository.KnowledgeBaseRepository;
import com.syed.intellidocs.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class KnowledgeBaseService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationAccessService organizationAccessService;

    public KnowledgeBaseService(
            KnowledgeBaseRepository knowledgeBaseRepository,
            OrganizationRepository organizationRepository,
            OrganizationAccessService organizationAccessService
    ) {
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.organizationRepository = organizationRepository;
        this.organizationAccessService = organizationAccessService;
    }


    public KnowledgeBaseResponse createKnowledgeBase(
            Long organizationId,
            CreateKnowledgeBaseRequest request
    ) {
        organizationAccessService.requireAdmin(organizationId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException());

        if(knowledgeBaseRepository.existsByNameAndOrganizationOrganizationId(
                request.getName(),
                organizationId
        )) {
            throw new KnowledgeBaseAlreadyExistsException();
        }

        KnowledgeBase knowledgeBase = new KnowledgeBase();

        knowledgeBase.setName(request.getName());
        knowledgeBase.setDescription(request.getDescription());
        knowledgeBase.setOrganization(organization);

        KnowledgeBase savedKnowledgeBase = knowledgeBaseRepository.save(knowledgeBase);

        return getKnowledgeBaseResponse(savedKnowledgeBase);
    }

    public List<KnowledgeBaseResponse> getKnowledgeBases(Long organizationId) {
        organizationAccessService.getMembership(organizationId);

        List<KnowledgeBase> knowledgeBases = knowledgeBaseRepository.findByOrganizationOrganizationId(organizationId);

        List<KnowledgeBaseResponse> responses = new ArrayList<>();

        for (KnowledgeBase knowledgeBase : knowledgeBases) {
            KnowledgeBaseResponse response = getKnowledgeBaseResponse(knowledgeBase);
            responses.add(response);
        }
        return responses;
    }

    private static KnowledgeBaseResponse getKnowledgeBaseResponse(KnowledgeBase savedKnowledgeBase) {
        KnowledgeBaseResponse response = new KnowledgeBaseResponse();

        response.setKnowledgeBaseId(savedKnowledgeBase.getKnowledgeBaseId());
        response.setName(savedKnowledgeBase.getName());
        response.setDescription(savedKnowledgeBase.getDescription());
        response.setOrganizationId(savedKnowledgeBase.getOrganization().getOrganizationId());
        response.setOrganizationName(savedKnowledgeBase.getOrganization().getOrganizationName());
        response.setCreatedAt(savedKnowledgeBase.getCreatedAt());
        return response;
    }
}
