package com.syed.intellidocs.service;

import com.syed.intellidocs.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadRoot;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir);
    }
    public String store(
            MultipartFile file,
            Long organizationId,
            Long knowledgeBaseId
    ) {
        String storedFileName = UUID.randomUUID() + ".pdf";
        Path directory = uploadRoot
                .resolve("organizations")
                .resolve(organizationId.toString())
                .resolve("knowledge-bases")
                .resolve(knowledgeBaseId.toString());
        try {
            Files.createDirectories(directory);

            Path destination = directory.resolve(storedFileName);

            file.transferTo(destination);

            return uploadRoot.relativize(destination).toString();

        } catch (IOException e) {
            throw new FileStorageException("Failed to store uploaded document", e);
        }
    }

    public Path getPath(String storageKey) {
        return uploadRoot.resolve(storageKey);
    }
}
