package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.response.DocumentResponse;
import com.syed.intellidocs.entity.Document;
import com.syed.intellidocs.entity.KnowledgeBase;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.enums.DocumentStatus;
import com.syed.intellidocs.exception.DocumentAlreadyExistsException;
import com.syed.intellidocs.exception.DocumentNotFoundException;
import com.syed.intellidocs.exception.DocumentProcessingInProgressException;
import com.syed.intellidocs.exception.InvalidDocumentException;
import com.syed.intellidocs.exception.KnowledgeBaseNotFoundException;
import com.syed.intellidocs.repository.DocumentChunkRepository;
import com.syed.intellidocs.repository.DocumentRepository;
import com.syed.intellidocs.repository.KnowledgeBaseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    private static final Long ORGANIZATION_ID = 1L;
    private static final Long KNOWLEDGE_BASE_ID = 10L;
    private static final Long DOCUMENT_ID = 100L;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private KnowledgeBaseRepository knowledgeBaseRepository;

    @Mock
    private OrganizationAccessService organizationAccessService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private DocumentProcessingService documentProcessingService;

    @Mock
    private DocumentChunkRepository documentChunkRepository;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void uploadDocument_shouldUploadValidPdf() {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MockMultipartFile file =
                createValidPdf();

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        when(
                documentRepository
                        .existsByOriginalFileNameAndKnowledgeBaseKnowledgeBaseId(
                                "policy.pdf",
                                KNOWLEDGE_BASE_ID
                        )
        ).thenReturn(false);

        when(
                fileStorageService.store(
                        file,
                        ORGANIZATION_ID,
                        KNOWLEDGE_BASE_ID
                )
        ).thenReturn(
                "organizations/1/knowledge-bases/10/policy.pdf"
        );

        when(
                documentRepository.save(
                        any(Document.class)
                )
        ).thenAnswer(invocation -> {

            Document document =
                    invocation.getArgument(0);

            document.setDocumentId(
                    DOCUMENT_ID
            );

            return document;
        });

        DocumentResponse response =
                documentService.uploadDocument(
                        ORGANIZATION_ID,
                        KNOWLEDGE_BASE_ID,
                        file
                );

        assertEquals(
                DOCUMENT_ID,
                response.getDocumentId()
        );

        assertEquals(
                "policy.pdf",
                response.getOriginalFileName()
        );

        assertEquals(
                "application/pdf",
                response.getContentType()
        );

        assertEquals(
                DocumentStatus.PROCESSING,
                response.getStatus()
        );

        assertEquals(
                KNOWLEDGE_BASE_ID,
                response.getKnowledgeBaseId()
        );

        verify(organizationAccessService)
                .requireAdmin(ORGANIZATION_ID);

        verify(documentRepository)
                .save(any(Document.class));

        verify(documentProcessingService)
                .processDocument(DOCUMENT_ID);
    }

    @Test
    void uploadDocument_shouldThrowWhenKnowledgeBaseDoesNotExist() {

        MockMultipartFile file =
                createValidPdf();

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(Optional.empty());

        assertThrows(
                KnowledgeBaseNotFoundException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );
    }

    @Test
    void uploadDocument_shouldThrowWhenFileIsEmpty() {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "empty.pdf",
                        "application/pdf",
                        new byte[0]
                );

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        assertThrows(
                InvalidDocumentException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );
    }

    @Test
    void uploadDocument_shouldThrowWhenFileIsNotPdf() {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "notes.txt",
                        "text/plain",
                        "Hello".getBytes()
                );

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        assertThrows(
                InvalidDocumentException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );
    }

    @Test
    void uploadDocument_shouldThrowWhenPdfSignatureIsInvalid() {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "fake.pdf",
                        "application/pdf",
                        "NOT-A-PDF".getBytes()
                );

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        assertThrows(
                InvalidDocumentException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );
    }

    @Test
    void uploadDocument_shouldThrowWhenDocumentAlreadyExists() {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MockMultipartFile file =
                createValidPdf();

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        when(
                documentRepository
                        .existsByOriginalFileNameAndKnowledgeBaseKnowledgeBaseId(
                                "policy.pdf",
                                KNOWLEDGE_BASE_ID
                        )
        ).thenReturn(true);

        assertThrows(
                DocumentAlreadyExistsException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );

        verify(documentRepository, never())
                .save(any());
    }

    @Test
    void uploadDocument_shouldThrowWhenPdfCannotBeRead()
            throws IOException {

        KnowledgeBase knowledgeBase =
                createKnowledgeBase();

        MultipartFile file =
                mock(MultipartFile.class);

        when(file.isEmpty())
                .thenReturn(false);

        when(file.getContentType())
                .thenReturn("application/pdf");

        when(file.getInputStream())
                .thenThrow(
                        new IOException(
                                "Unable to read file"
                        )
                );

        when(
                knowledgeBaseRepository
                        .findByKnowledgeBaseIdAndOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(knowledgeBase)
        );

        assertThrows(
                InvalidDocumentException.class,
                () ->
                        documentService
                                .uploadDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        file
                                )
        );

        verify(fileStorageService, never())
                .store(
                        any(),
                        anyLong(),
                        anyLong()
                );
    }

    @Test
    void getDocument_shouldReturnDocument() {

        Document document =
                createDocument(
                        DocumentStatus.READY
                );

        when(
                documentRepository
                        .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                DOCUMENT_ID,
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(document)
        );

        DocumentResponse response =
                documentService.getDocument(
                        ORGANIZATION_ID,
                        KNOWLEDGE_BASE_ID,
                        DOCUMENT_ID
                );

        assertEquals(
                DOCUMENT_ID,
                response.getDocumentId()
        );

        assertEquals(
                "policy.pdf",
                response.getOriginalFileName()
        );

        assertEquals(
                DocumentStatus.READY,
                response.getStatus()
        );

        verify(organizationAccessService)
                .getMembership(
                        ORGANIZATION_ID
                );
    }

    @Test
    void getDocument_shouldThrowWhenDocumentDoesNotExist() {

        when(
                documentRepository
                        .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                DOCUMENT_ID,
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                DocumentNotFoundException.class,
                () ->
                        documentService
                                .getDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        DOCUMENT_ID
                                )
        );
    }

    @Test
    void getDocuments_shouldReturnDocuments() {

        Document first =
                createDocument(
                        DocumentStatus.READY
                );

        Document second =
                createDocument(
                        DocumentStatus.PROCESSING
                );

        second.setDocumentId(101L);
        second.setOriginalFileName(
                "handbook.pdf"
        );

        when(
                documentRepository
                        .findByKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                List.of(first, second)
        );

        List<DocumentResponse> responses =
                documentService.getDocuments(
                        ORGANIZATION_ID,
                        KNOWLEDGE_BASE_ID
                );

        assertEquals(
                2,
                responses.size()
        );

        assertEquals(
                "policy.pdf",
                responses.get(0)
                        .getOriginalFileName()
        );

        assertEquals(
                "handbook.pdf",
                responses.get(1)
                        .getOriginalFileName()
        );

        verify(organizationAccessService)
                .getMembership(
                        ORGANIZATION_ID
                );
    }

    @Test
    void deleteDocument_shouldDeleteReadyDocument() {

        Document document =
                createDocument(
                        DocumentStatus.READY
                );

        when(
                documentRepository
                        .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                DOCUMENT_ID,
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(document)
        );

        documentService.deleteDocument(
                ORGANIZATION_ID,
                KNOWLEDGE_BASE_ID,
                DOCUMENT_ID
        );

        verify(organizationAccessService)
                .requireAdmin(
                        ORGANIZATION_ID
                );

        verify(documentChunkRepository)
                .deleteByDocumentDocumentId(
                        DOCUMENT_ID
                );

        verify(documentRepository)
                .delete(document);

        verify(fileStorageService)
                .delete(
                        document.getStorageKey()
                );
    }

    @Test
    void deleteDocument_shouldThrowWhenDocumentIsProcessing() {

        Document document =
                createDocument(
                        DocumentStatus.PROCESSING
                );

        when(
                documentRepository
                        .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                DOCUMENT_ID,
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.of(document)
        );

        assertThrows(
                DocumentProcessingInProgressException.class,
                () ->
                        documentService
                                .deleteDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        DOCUMENT_ID
                                )
        );

        verify(documentChunkRepository, never())
                .deleteByDocumentDocumentId(
                        anyLong()
                );

        verify(documentRepository, never())
                .delete(any());

        verify(fileStorageService, never())
                .delete(any());
    }

    @Test
    void deleteDocument_shouldThrowWhenDocumentDoesNotExist() {

        when(
                documentRepository
                        .findByDocumentIdAndKnowledgeBaseKnowledgeBaseIdAndKnowledgeBaseOrganizationOrganizationId(
                                DOCUMENT_ID,
                                KNOWLEDGE_BASE_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                DocumentNotFoundException.class,
                () ->
                        documentService
                                .deleteDocument(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        DOCUMENT_ID
                                )
        );

        verify(documentRepository, never())
                .delete(any());

        verify(fileStorageService, never())
                .delete(any());
    }

    private MockMultipartFile createValidPdf() {

        return new MockMultipartFile(
                "file",
                "policy.pdf",
                "application/pdf",
                "%PDF-1.7 test content"
                        .getBytes()
        );
    }

    private KnowledgeBase createKnowledgeBase() {

        Organization organization =
                new Organization();

        organization.setOrganizationId(
                ORGANIZATION_ID
        );

        organization.setOrganizationName(
                "Acme"
        );

        KnowledgeBase knowledgeBase =
                new KnowledgeBase();

        knowledgeBase.setKnowledgeBaseId(
                KNOWLEDGE_BASE_ID
        );

        knowledgeBase.setName(
                "Company Policies"
        );

        knowledgeBase.setOrganization(
                organization
        );

        return knowledgeBase;
    }

    private Document createDocument(
            DocumentStatus status
    ) {

        Document document =
                new Document();

        document.setDocumentId(
                DOCUMENT_ID
        );

        document.setOriginalFileName(
                "policy.pdf"
        );

        document.setContentType(
                "application/pdf"
        );

        document.setFileSize(
                1024L
        );

        document.setStorageKey(
                "organizations/1/knowledge-bases/10/policy.pdf"
        );

        document.setStatus(status);

        document.setKnowledgeBase(
                createKnowledgeBase()
        );

        return document;
    }
}