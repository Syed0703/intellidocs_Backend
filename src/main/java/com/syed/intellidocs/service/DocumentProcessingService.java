package com.syed.intellidocs.service;

import com.syed.intellidocs.entity.Document;
import com.syed.intellidocs.entity.DocumentChunk;
import com.syed.intellidocs.enums.DocumentStatus;
import com.syed.intellidocs.repository.DocumentChunkRepository;
import com.syed.intellidocs.repository.DocumentRepository;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.List;

@Service
public class DocumentProcessingService {
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final DocumentChunkService documentChunkService;
    private final DocumentChunkRepository documentChunkRepository;
    private final EmbeddingModel embeddingModel;

    public DocumentProcessingService(
            DocumentRepository documentRepository,
            FileStorageService fileStorageService,
            PdfTextExtractorService pdfTextExtractorService,
            DocumentChunkService documentChunkService,
            DocumentChunkRepository documentChunkRepository,
            EmbeddingModel embeddingModel
    ) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.pdfTextExtractorService = pdfTextExtractorService;
        this.documentChunkService = documentChunkService;
        this.documentChunkRepository = documentChunkRepository;
        this.embeddingModel = embeddingModel;
    }

    @Async
    public void processDocument(Long documentId) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        try {
            Path pdfPath =
                    fileStorageService.getPath(document.getStorageKey());

            String extractedText =
                    pdfTextExtractorService.extractText(pdfPath);

            List<String> chunks =
                    documentChunkService.chunk(extractedText);

            for (int i = 0; i < chunks.size(); i++) {

                String chunkText = chunks.get(i);

                float[] embedding =
                        embeddingModel.embed(chunkText);

                DocumentChunk documentChunk =
                        new DocumentChunk();

                documentChunk.setDocument(document);
                documentChunk.setChunkIndex(i);
                documentChunk.setContent(chunkText);
                documentChunk.setEmbedding(embedding);

                documentChunkRepository.save(documentChunk);
            }

            document.setStatus(DocumentStatus.READY);
            documentRepository.save(document);

        } catch (RuntimeException ex) {

            document.setStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
        }
    }
}
