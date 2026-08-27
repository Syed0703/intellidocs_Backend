package com.syed.intellidocs.service;

import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.exception.DocumentAlreadyExistsException;
import com.syed.intellidocs.exception.InvalidDocumentException;
import com.syed.intellidocs.exception.KnowledgeBaseNotFoundException;
import com.syed.intellidocs.repository.DocumentRepository;
import com.syed.intellidocs.repository.KnowledgeBaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final OrganizationAccessService organizationAccessService;

    public DocumentService(
            DocumentRepository documentRepository,
            KnowledgeBaseRepository knowledgeBaseRepository,
            OrganizationAccessService organizationAccessService
    ) {
        this.documentRepository = documentRepository;
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.organizationAccessService = organizationAccessService;
    }

    public void uploadDocument(
            Long organizationId,
            Long knowledgeBaseId,
            MultipartFile file
    ) {
        organizationAccessService.requireAdmin(organizationId);
        KnowledgeBase knowledgeBase = knowledgeBaseRepository
                .findByKnowledgeBaseIdAndOrganizationOrganizationId(knowledgeBaseId, organizationId)
                .orElseThrow(() -> new KnowledgeBaseNotFoundException());

        if(file.isEmpty()) {
            throw new InvalidDocumentException("Uploaded document is empty");
        }

        if(!"application/pdf".equals(file.getContentType())) {
            throw new InvalidDocumentException("Only PDF documents are supported");
        }

        String originalFileName = file.getOriginalFilename();
        if(documentRepository
                .existsByOriginalFileNameAndKnowledgeKnowledgeBaseId(
                        originalFileName,
                        knowledgeBaseId
                )
        ) {
            throw new DocumentAlreadyExistsException();
        }
    }

}
