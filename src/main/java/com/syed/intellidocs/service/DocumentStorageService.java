package com.syed.intellidocs.service;

import org.springframework.web.multipart.MultipartFile;

public interface DocumentStorageService {

    String store(
            MultipartFile file,
            Long organizationId,
            Long knowledgeBaseId
    );

    byte[] load(String storageKey);

    void delete(String storageKey);
}