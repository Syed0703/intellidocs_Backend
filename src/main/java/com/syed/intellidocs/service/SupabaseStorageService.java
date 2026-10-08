package com.syed.intellidocs.service;

import com.syed.intellidocs.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Profile("prod")
public class SupabaseStorageService
        implements DocumentStorageService {

    private final RestClient restClient;
    private final String bucket;

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.secret-key}") String secretKey,
            @Value("${supabase.storage.bucket}") String bucket
    ) {

        String normalizedUrl =
                supabaseUrl.endsWith("/")
                        ? supabaseUrl.substring(
                        0,
                        supabaseUrl.length() - 1
                )
                        : supabaseUrl;

        this.restClient = RestClient
                .builder()
                .baseUrl(normalizedUrl)
                .defaultHeader(
                        "apikey",
                        secretKey
                )
                .build();

        this.bucket = bucket;
    }

    @Override
    public String store(
            MultipartFile file,
            Long organizationId,
            Long knowledgeBaseId
    ) {

        String storageKey =
                "organizations/"
                        + organizationId
                        + "/knowledge-bases/"
                        + knowledgeBaseId
                        + "/"
                        + UUID.randomUUID()
                        + ".pdf";

        try {

            byte[] fileBytes =
                    file.getBytes();

            restClient
                    .post()
                    .uri(
                            "/storage/v1/object/"
                                    + bucket
                                    + "/"
                                    + storageKey
                    )
                    .contentType(
                            MediaType.APPLICATION_PDF
                    )
                    .header(
                            "x-upsert",
                            "false"
                    )
                    .body(fileBytes)
                    .retrieve()
                    .toBodilessEntity();

            return storageKey;

        } catch (IOException ex) {

            throw new FileStorageException(
                    "Failed to read uploaded document",
                    ex
            );

        } catch (RestClientResponseException ex) {

            throw new FileStorageException(
                    "Failed to store document in cloud storage. Status: "
                            + ex.getStatusCode()
                            + ", Response: "
                            + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (RestClientException ex) {

            throw new FileStorageException(
                    "Failed to store document in cloud storage",
                    ex
            );
        }
    }

    @Override
    public byte[] load(String storageKey) {

        validateStorageKey(storageKey);

        try {

            byte[] fileBytes =
                    restClient
                            .get()
                            .uri(
                                    "/storage/v1/object/"
                                            + bucket
                                            + "/"
                                            + storageKey
                            )
                            .retrieve()
                            .body(byte[].class);

            if (fileBytes == null) {
                throw new FileStorageException(
                        "Stored document is empty"
                );
            }

            return fileBytes;

        } catch (RestClientException ex) {

            throw new FileStorageException(
                    "Failed to load document from cloud storage",
                    ex
            );
        }
    }

    @Override
    public void delete(String storageKey) {

        validateStorageKey(storageKey);

        try {

            restClient
                    .delete()
                    .uri(
                            "/storage/v1/object/"
                                    + bucket
                                    + "/"
                                    + storageKey
                    )
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException ex) {

            throw new FileStorageException(
                    "Failed to delete document from cloud storage",
                    ex
            );
        }
    }

    private void validateStorageKey(
            String storageKey
    ) {

        if (
                storageKey == null
                        || storageKey.isBlank()
                        || storageKey.contains("..")
                        || storageKey.contains("\\")
                        || storageKey.startsWith("/")
        ) {
            throw new FileStorageException(
                    "Invalid storage key"
            );
        }
    }
}