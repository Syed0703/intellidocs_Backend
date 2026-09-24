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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KnowledgeBaseServiceTest {

    private static final Long ORGANIZATION_ID = 1L;
    private static final Long KNOWLEDGE_BASE_ID = 10L;

    @Mock
    private KnowledgeBaseRepository knowledgeBaseRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationAccessService organizationAccessService;

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private KnowledgeBaseService knowledgeBaseService;

    @Test
    void createKnowledgeBase_shouldCreateKnowledgeBase() {

        Organization organization = createOrganization();

        CreateKnowledgeBaseRequest request =
                new CreateKnowledgeBaseRequest();

        request.setName("Company Policies");
        request.setDescription("Internal company policies");

        when(
                organizationRepository.findById(
                        ORGANIZATION_ID
                )
        ).thenReturn(Optional.of(organization));

        when(
                knowledgeBaseRepository
                        .existsByNameAndOrganizationOrganizationId(
                                "Company Policies",
                                ORGANIZATION_ID
                        )
        ).thenReturn(false);

        when(
                knowledgeBaseRepository.save(
                        any(KnowledgeBase.class)
                )
        ).thenAnswer(invocation -> {

            KnowledgeBase knowledgeBase =
                    invocation.getArgument(0);

            knowledgeBase.setKnowledgeBaseId(
                    KNOWLEDGE_BASE_ID
            );

            return knowledgeBase;
        });

        KnowledgeBaseResponse response =
                knowledgeBaseService
                        .createKnowledgeBase(
                                ORGANIZATION_ID,
                                request
                        );

        assertEquals(
                KNOWLEDGE_BASE_ID,
                response.getKnowledgeBaseId()
        );

        assertEquals(
                "Company Policies",
                response.getName()
        );

        assertEquals(
                "Internal company policies",
                response.getDescription()
        );

        assertEquals(
                ORGANIZATION_ID,
                response.getOrganizationId()
        );

        verify(organizationAccessService)
                .requireAdmin(ORGANIZATION_ID);

        verify(knowledgeBaseRepository)
                .save(any(KnowledgeBase.class));
    }

    @Test
    void createKnowledgeBase_shouldThrowWhenOrganizationDoesNotExist() {

        CreateKnowledgeBaseRequest request =
                new CreateKnowledgeBaseRequest();

        request.setName("Policies");

        when(
                organizationRepository.findById(
                        ORGANIZATION_ID
                )
        ).thenReturn(Optional.empty());

        assertThrows(
                OrganizationNotFoundException.class,
                () ->
                        knowledgeBaseService
                                .createKnowledgeBase(
                                        ORGANIZATION_ID,
                                        request
                                )
        );

        verify(knowledgeBaseRepository, never())
                .save(any());
    }

    @Test
    void createKnowledgeBase_shouldThrowWhenNameAlreadyExists() {

        Organization organization =
                createOrganization();

        CreateKnowledgeBaseRequest request =
                new CreateKnowledgeBaseRequest();

        request.setName("Policies");

        when(
                organizationRepository.findById(
                        ORGANIZATION_ID
                )
        ).thenReturn(Optional.of(organization));

        when(
                knowledgeBaseRepository
                        .existsByNameAndOrganizationOrganizationId(
                                "Policies",
                                ORGANIZATION_ID
                        )
        ).thenReturn(true);

        assertThrows(
                KnowledgeBaseAlreadyExistsException.class,
                () ->
                        knowledgeBaseService
                                .createKnowledgeBase(
                                        ORGANIZATION_ID,
                                        request
                                )
        );

        verify(knowledgeBaseRepository, never())
                .save(any());
    }

    @Test
    void getKnowledgeBases_shouldReturnOrganizationKnowledgeBases() {

        Organization organization =
                createOrganization();

        KnowledgeBase first =
                createKnowledgeBase(
                        10L,
                        "Policies",
                        organization
                );

        KnowledgeBase second =
                createKnowledgeBase(
                        11L,
                        "Engineering",
                        organization
                );

        when(
                knowledgeBaseRepository
                        .findByOrganizationOrganizationId(
                                ORGANIZATION_ID
                        )
        ).thenReturn(
                List.of(first, second)
        );

        List<KnowledgeBaseResponse> responses =
                knowledgeBaseService
                        .getKnowledgeBases(
                                ORGANIZATION_ID
                        );

        assertEquals(2, responses.size());

        assertEquals(
                "Policies",
                responses.get(0).getName()
        );

        assertEquals(
                "Engineering",
                responses.get(1).getName()
        );

        verify(organizationAccessService)
                .getMembership(ORGANIZATION_ID);
    }

    @Test
    void updateKnowledgeBase_shouldUpdateNameAndDescription() {

        Organization organization =
                createOrganization();

        KnowledgeBase knowledgeBase =
                createKnowledgeBase(
                        KNOWLEDGE_BASE_ID,
                        "Old Name",
                        organization
                );

        UpdateKnowledgeBaseRequest request =
                new UpdateKnowledgeBaseRequest();

        request.setName("  New Name  ");
        request.setDescription(
                "  Updated description  "
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

        when(
                knowledgeBaseRepository
                        .existsByNameAndOrganizationOrganizationId(
                                "New Name",
                                ORGANIZATION_ID
                        )
        ).thenReturn(false);

        when(
                knowledgeBaseRepository.save(
                        knowledgeBase
                )
        ).thenReturn(knowledgeBase);

        KnowledgeBaseResponse response =
                knowledgeBaseService
                        .updateKnowledgeBase(
                                ORGANIZATION_ID,
                                KNOWLEDGE_BASE_ID,
                                request
                        );

        assertEquals(
                "New Name",
                response.getName()
        );

        assertEquals(
                "Updated description",
                response.getDescription()
        );

        verify(organizationAccessService)
                .requireAdmin(ORGANIZATION_ID);
    }

    @Test
    void updateKnowledgeBase_shouldSetBlankDescriptionToNull() {

        Organization organization =
                createOrganization();

        KnowledgeBase knowledgeBase =
                createKnowledgeBase(
                        KNOWLEDGE_BASE_ID,
                        "Policies",
                        organization
                );

        knowledgeBase.setDescription(
                "Old description"
        );

        UpdateKnowledgeBaseRequest request =
                new UpdateKnowledgeBaseRequest();

        request.setName("Policies");
        request.setDescription("   ");

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
                knowledgeBaseRepository.save(
                        knowledgeBase
                )
        ).thenReturn(knowledgeBase);

        KnowledgeBaseResponse response =
                knowledgeBaseService
                        .updateKnowledgeBase(
                                ORGANIZATION_ID,
                                KNOWLEDGE_BASE_ID,
                                request
                        );

        assertNull(response.getDescription());
    }

    @Test
    void updateKnowledgeBase_shouldThrowWhenNewNameAlreadyExists() {

        Organization organization =
                createOrganization();

        KnowledgeBase knowledgeBase =
                createKnowledgeBase(
                        KNOWLEDGE_BASE_ID,
                        "Policies",
                        organization
                );

        UpdateKnowledgeBaseRequest request =
                new UpdateKnowledgeBaseRequest();

        request.setName("Engineering");
        request.setDescription("Description");

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
                knowledgeBaseRepository
                        .existsByNameAndOrganizationOrganizationId(
                                "Engineering",
                                ORGANIZATION_ID
                        )
        ).thenReturn(true);

        assertThrows(
                KnowledgeBaseAlreadyExistsException.class,
                () ->
                        knowledgeBaseService
                                .updateKnowledgeBase(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        request
                                )
        );

        verify(knowledgeBaseRepository, never())
                .save(any());
    }

    @Test
    void updateKnowledgeBase_shouldThrowWhenKnowledgeBaseDoesNotExist() {

        UpdateKnowledgeBaseRequest request =
                new UpdateKnowledgeBaseRequest();

        request.setName("Policies");

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
                        knowledgeBaseService
                                .updateKnowledgeBase(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID,
                                        request
                                )
        );
    }

    @Test
    void deleteKnowledgeBase_shouldDeleteWhenEmpty() {

        Organization organization =
                createOrganization();

        KnowledgeBase knowledgeBase =
                createKnowledgeBase(
                        KNOWLEDGE_BASE_ID,
                        "Policies",
                        organization
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

        when(
                documentRepository
                        .existsByKnowledgeBaseKnowledgeBaseId(
                                KNOWLEDGE_BASE_ID
                        )
        ).thenReturn(false);

        knowledgeBaseService.deleteKnowledgeBase(
                ORGANIZATION_ID,
                KNOWLEDGE_BASE_ID
        );

        verify(organizationAccessService)
                .requireAdmin(ORGANIZATION_ID);

        verify(knowledgeBaseRepository)
                .delete(knowledgeBase);
    }

    @Test
    void deleteKnowledgeBase_shouldThrowWhenKnowledgeBaseContainsDocuments() {

        Organization organization =
                createOrganization();

        KnowledgeBase knowledgeBase =
                createKnowledgeBase(
                        KNOWLEDGE_BASE_ID,
                        "Policies",
                        organization
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

        when(
                documentRepository
                        .existsByKnowledgeBaseKnowledgeBaseId(
                                KNOWLEDGE_BASE_ID
                        )
        ).thenReturn(true);

        assertThrows(
                KnowledgeBaseNotEmptyException.class,
                () ->
                        knowledgeBaseService
                                .deleteKnowledgeBase(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID
                                )
        );

        verify(knowledgeBaseRepository, never())
                .delete(any());
    }

    @Test
    void deleteKnowledgeBase_shouldThrowWhenKnowledgeBaseDoesNotExist() {

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
                        knowledgeBaseService
                                .deleteKnowledgeBase(
                                        ORGANIZATION_ID,
                                        KNOWLEDGE_BASE_ID
                                )
        );

        verify(knowledgeBaseRepository, never())
                .delete(any());
    }

    private Organization createOrganization() {

        Organization organization =
                new Organization();

        organization.setOrganizationId(
                ORGANIZATION_ID
        );

        organization.setOrganizationName(
                "Acme"
        );

        return organization;
    }

    private KnowledgeBase createKnowledgeBase(
            Long id,
            String name,
            Organization organization
    ) {

        KnowledgeBase knowledgeBase =
                new KnowledgeBase();

        knowledgeBase.setKnowledgeBaseId(id);
        knowledgeBase.setName(name);
        knowledgeBase.setOrganization(
                organization
        );

        return knowledgeBase;
    }
}