package com.syed.intellidocs.service;
import com.syed.intellidocs.dto.response.DocumentResponse;
import com.syed.intellidocs.entity.Document;
import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.enums.DocumentStatus;
import com.syed.intellidocs.exception.*;
import com.syed.intellidocs.repository.DocumentChunkRepository;
import com.syed.intellidocs.repository.DocumentRepository;
import com.syed.intellidocs.repository.KnowledgeBaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;


@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final OrganizationAccessService organizationAccessService;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;
    private DocumentChunkRepository documentChunkRepository;

    public DocumentService(
            DocumentRepository documentRepository,
            KnowledgeBaseRepository knowledgeBaseRepository,
            OrganizationAccessService organizationAccessService,
            FileStorageService fileStorageService,
            DocumentProcessingService documentProcessingService,
            DocumentChunkRepository documentChunkRepository
    ) {
        this.documentRepository = documentRepository;
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.organizationAccessService = organizationAccessService;
        this.fileStorageService = fileStorageService;
        this.documentProcessingService = documentProcessingService;
        this.documentChunkRepository = documentChunkRepository;
    }

    public DocumentResponse uploadDocument(
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
                .existsByOriginalFileNameAndKnowledgeBaseKnowledgeBaseId(
                        originalFileName,
                        knowledgeBaseId
                )
        ) {
            throw new DocumentAlreadyExistsException();
        }

        String storageKey = fileStorageService.store(file, organizationId, knowledgeBaseId);

        Document document = new Document();
        document.setOriginalFileName(file.getOriginalFilename());
        document.setStorageKey(storageKey);
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setStatus(DocumentStatus.PROCESSING);
        document.setKnowledgeBase(knowledgeBase);

        Document savedDocument = documentRepository.save(document);

        documentProcessingService.processDocument(savedDocument.getDocumentId());

        return getDocumentResponse(savedDocument);
    }

    public DocumentResponse getDocument(
            Long organizationId,
            Long knowledgeBaseId,
            Long documentId
    ) {
        organizationAccessService.getMembership(organizationId);

        Document document = documentRepository
                .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                        documentId,
                        knowledgeBaseId,
                        organizationId
                )
                .orElseThrow(() ->
                        new DocumentNotFoundException()
                );

        return getDocumentResponse(document);
    }

    public List<DocumentResponse> getDocuments(
            Long organizationId,
            Long knowledgeBaseId
    ) {
        organizationAccessService.getMembership(organizationId);

        List<Document> documents = documentRepository
                .findByKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                        knowledgeBaseId,
                        organizationId
                );

        List<DocumentResponse> responses = new ArrayList<>();

        for (Document document : documents) {
            responses.add(getDocumentResponse(document));
        }

        return responses;
    }


    @Transactional
    public void deleteDocument(
            Long organizationId,
            Long knowledgeBaseId,
            Long documentId
    ) {
        organizationAccessService.requireAdmin(organizationId);

        Document document = documentRepository
                .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                        documentId,
                        knowledgeBaseId,
                        organizationId
                ).orElseThrow(() -> new DocumentNotFoundException());

        if(document.getStatus() == DocumentStatus.PROCESSING) {
            throw new DocumentProcessingInProgressException();
        }

        documentChunkRepository.deleteByDocumentDocumentId(documentId);

        documentRepository.delete(document);

        fileStorageService.delete(document.getStorageKey());
    }

    private static DocumentResponse getDocumentResponse(Document savedDocument) {
        DocumentResponse response = new DocumentResponse();
        response.setDocumentId(savedDocument.getDocumentId());
        response.setOriginalFileName(savedDocument.getOriginalFileName());
        response.setContentType(savedDocument.getContentType());
        response.setFileSize(savedDocument.getFileSize());
        response.setStatus(savedDocument.getStatus());
        response.setKnowledgeBaseId(savedDocument.getKnowledgeBase().getKnowledgeBaseId());
        response.setCreatedAt(savedDocument.getCreatedAt());
        return response;
    }

}
