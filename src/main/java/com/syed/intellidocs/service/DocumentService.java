package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.DocumentResponse;
import com.syed.intellidocs.entity.Document;
import com.syed.intellidocs.entity.DocumentChunk;
import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.enums.DocumentStatus;
import com.syed.intellidocs.exception.DocumentAlreadyExistsException;
import com.syed.intellidocs.exception.InvalidDocumentException;
import com.syed.intellidocs.exception.KnowledgeBaseNotFoundException;
import com.syed.intellidocs.repository.DocumentChunkRepository;
import com.syed.intellidocs.repository.DocumentRepository;
import com.syed.intellidocs.repository.KnowledgeBaseRepository;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final OrganizationAccessService organizationAccessService;
    private final FileStorageService fileStorageService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final DocumentChunkService documentChunkService;
    private final DocumentChunkRepository documentChunkRepository;
    private final EmbeddingModel embeddingModel;

    public DocumentService(
            DocumentRepository documentRepository,
            KnowledgeBaseRepository knowledgeBaseRepository,
            OrganizationAccessService organizationAccessService,
            FileStorageService fileStorageService,
            PdfTextExtractorService pdfTextExtractorService,
            DocumentChunkService documentChunkService,
            DocumentChunkRepository documentChunkRepository,
            EmbeddingModel embeddingModel
    ) {
        this.documentRepository = documentRepository;
        this.knowledgeBaseRepository = knowledgeBaseRepository;
        this.organizationAccessService = organizationAccessService;
        this.fileStorageService = fileStorageService;
        this.pdfTextExtractorService = pdfTextExtractorService;
        this.documentChunkService = documentChunkService;
        this.documentChunkRepository = documentChunkRepository;
        this.embeddingModel = embeddingModel;
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
        document.setStatus(DocumentStatus.UPLOADED);
        document.setKnowledgeBase(knowledgeBase);

        Document savedDocument = documentRepository.save(document);

        Path pdfPath = fileStorageService.getPath(savedDocument.getStorageKey());
        String extractedText = pdfTextExtractorService.extractText(pdfPath);

        List<String> chunks = documentChunkService.chunk(extractedText);

        for(int i = 0; i < chunks.size(); i++) {

            String chunkText  = chunks.get(i);

            float[] embeddings = embeddingModel.embed(chunkText);

            DocumentChunk documentChunk = new DocumentChunk();

            documentChunk.setDocument(savedDocument);
            documentChunk.setChunkIndex(i);
            documentChunk.setContent(chunks.get(i));
            documentChunk.setEmbedding(embeddings);

            documentChunkRepository.save(documentChunk);
        }

        return getDocumentResponse(savedDocument);
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
