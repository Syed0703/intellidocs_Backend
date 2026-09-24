package com.syed.intellidocs.service;

import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationAccessServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long ORGANIZATION_ID = 10L;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private CustomUserDetails customUserDetails;

    @InjectMocks
    private OrganizationAccessService organizationAccessService;

    @BeforeEach
    void setUpSecurityContext() {

        SecurityContext securityContext =
                SecurityContextHolder.createEmptyContext();

        securityContext.setAuthentication(authentication);

        SecurityContextHolder.setContext(securityContext);

        when(authentication.getPrincipal())
                .thenReturn(customUserDetails);

        when(customUserDetails.getUserId())
                .thenReturn(USER_ID);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getMembership_shouldReturnMembershipWhenUserBelongsToOrganization() {

        Membership membership =
                mock(Membership.class);

        when(
                membershipRepository
                        .findByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(Optional.of(membership));

        Membership result =
                organizationAccessService.getMembership(
                        ORGANIZATION_ID
                );

        assertEquals(membership, result);

        verify(membershipRepository)
                .findByUserUserIdAndOrganizationOrganizationId(
                        USER_ID,
                        ORGANIZATION_ID
                );
    }

    @Test
    void getMembership_shouldThrowWhenUserDoesNotBelongToOrganization() {

        when(
                membershipRepository
                        .findByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(Optional.empty());

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                organizationAccessService
                                        .getMembership(
                                                ORGANIZATION_ID
                                        )
                );

        assertEquals(
                "You do not have access to this organization",
                exception.getMessage()
        );
    }

    @Test
    void requireAdmin_shouldAllowAdmin() {

        Membership membership =
                mock(Membership.class);

        when(membership.getRole())
                .thenReturn(MembershipRole.ADMIN);

        when(
                membershipRepository
                        .findByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(Optional.of(membership));

        assertDoesNotThrow(
                () ->
                        organizationAccessService
                                .requireAdmin(
                                        ORGANIZATION_ID
                                )
        );
    }

    @Test
    void requireAdmin_shouldThrowWhenUserIsMember() {

        Membership membership =
                mock(Membership.class);

        when(membership.getRole())
                .thenReturn(MembershipRole.MEMBER);

        when(
                membershipRepository
                        .findByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(Optional.of(membership));

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                organizationAccessService
                                        .requireAdmin(
                                                ORGANIZATION_ID
                                        )
                );

        assertEquals(
                "Admin access required",
                exception.getMessage()
        );
    }
}