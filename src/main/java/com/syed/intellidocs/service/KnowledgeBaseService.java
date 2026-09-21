package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateKnowledgeBaseRequest;
import com.syed.intellidocs.dto.request.UpdateKnowledgeBaseRequest;
import com.syed.intellidocs.dto.response.KnowledgeBaseResponse;
import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.exception.KnowledgeBaseAlreadyExistsException;
import com.syed.intellidocs.exception.KnowledgeBaseNotEmptyException;
import com.syed.intellidocs.exception.KnowledgeBaseNotFoundException;
import com.syed.intellidocs.exception.OrganizationNotFoundException;
import com.syed.intellidocs.repository.DocumentRepository;
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
    private final DocumentRepository documentRepository;

    public KnowledgeBaseService(
            KnowledgeBaseRepository knowledgeBaseRepository,
            OrganizationRepository organizationRepository,
            OrganizationAccessService organizationAccessService,
            DocumentRepository documentRepository
    ) {
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.organizationRepository = organizationRepository;
        this.organizationAccessService = organizationAccessService;
        this.documentRepository = documentRepository;
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

    public KnowledgeBaseResponse updateKnowledgeBase(
            Long organizationId,
            Long knowledgeBaseId,
            UpdateKnowledgeBaseRequest request
    ) {
        organizationAccessService.requireAdmin(organizationId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository
                .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                        knowledgeBaseId,
                        organizationId
                ).orElseThrow(()-> new KnowledgeBaseAlreadyExistsException());

        String newName = request.getName().trim();

        if(!knowledgeBase.getName().equalsIgnoreCase(newName)
                && knowledgeBaseRepository
                .existsByNameAndOrganizationOrganizationId(
                        newName,
                        organizationId
                )
        ) {
            throw new KnowledgeBaseAlreadyExistsException();
        }

        knowledgeBase.setName(newName);

        String description = request.getDescription();

        knowledgeBase.setDescription(
                description == null || description.isBlank()
                        ? null
                        : description.trim()
        );

        KnowledgeBase savedKnowledgeBase =
                knowledgeBaseRepository.save(knowledgeBase);

        return getKnowledgeBaseResponse(savedKnowledgeBase);
    }

    public void deleteKnowledgeBase(
            Long organizationId,
            Long knowledgeBaseId
    ) {
        organizationAccessService.requireAdmin(organizationId);

        KnowledgeBase knowledgeBase = knowledgeBaseRepository
                .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                        knowledgeBaseId,
                        organizationId
                )
                .orElseThrow(() -> new KnowledgeBaseNotFoundException());

        boolean hasDocuments =
                documentRepository
                        .existsByKnowledgeBaseKnowledgeBaseId(
                                knowledgeBaseId
                        );

        if (hasDocuments) {
            throw new KnowledgeBaseNotEmptyException();
        }

        knowledgeBaseRepository.delete(knowledgeBase);
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
