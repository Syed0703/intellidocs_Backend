package com.syed.intellidocs.service;

import com.syed.intellidocs.entity.Membership;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.enums.MembershipRole;
import com.syed.intellidocs.exception.MembershipAlreadyExistsException;
import com.syed.intellidocs.exception.OrganizationNotFoundException;
import com.syed.intellidocs.exception.UserNotFoundException;
import com.syed.intellidocs.repository.MembershipRepository;
import com.syed.intellidocs.repository.OrganizationRepository;
import com.syed.intellidocs.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    private static final Long ORGANIZATION_ID = 1L;
    private static final Long USER_ID = 1L;
    private static final String USER_EMAIL = "member@example.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private OrganizationAccessService organizationAccessService;

    @InjectMocks
    private MembershipService membershipService;

    @Test
    void createMembership_shouldCreateMembership() {

        User user = new User();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);
        user.setName("Test User");

        Organization organization = new Organization();
        organization.setOrganizationId(ORGANIZATION_ID);
        organization.setOrganizationName("Test Organization");

        when(userRepository.findByEmail(USER_EMAIL))
                .thenReturn(Optional.of(user));

        when(organizationRepository.findById(ORGANIZATION_ID))
                .thenReturn(Optional.of(organization));

        when(
                membershipRepository
                        .existsByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(false);

        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        membershipService.createMembership(
                USER_EMAIL,
                ORGANIZATION_ID,
                MembershipRole.MEMBER
        );

        ArgumentCaptor<Membership> captor =
                ArgumentCaptor.forClass(Membership.class);

        verify(membershipRepository)
                .save(captor.capture());

        Membership savedMembership =
                captor.getValue();

        assertEquals(
                user,
                savedMembership.getUser()
        );

        assertEquals(
                organization,
                savedMembership.getOrganization()
        );

        assertEquals(
                MembershipRole.MEMBER,
                savedMembership.getRole()
        );
    }

    @Test
    void createMembership_shouldThrowWhenUserDoesNotExist() {

        when(userRepository.findByEmail(USER_EMAIL))
                .thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> membershipService.createMembership(
                        USER_EMAIL,
                        ORGANIZATION_ID,
                        MembershipRole.MEMBER
                )
        );
    }

    @Test
    void createMembership_shouldThrowWhenOrganizationDoesNotExist() {

        User user = new User();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userRepository.findByEmail(USER_EMAIL))
                .thenReturn(Optional.of(user));

        when(organizationRepository.findById(ORGANIZATION_ID))
                .thenReturn(Optional.empty());

        assertThrows(
                OrganizationNotFoundException.class,
                () -> membershipService.createMembership(
                        USER_EMAIL,
                        ORGANIZATION_ID,
                        MembershipRole.MEMBER
                )
        );
    }

    @Test
    void createMembership_shouldThrowWhenMembershipAlreadyExists() {

        User user = new User();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        Organization organization =
                new Organization();

        organization.setOrganizationId(
                ORGANIZATION_ID
        );

        when(userRepository.findByEmail(USER_EMAIL))
                .thenReturn(Optional.of(user));

        when(organizationRepository.findById(ORGANIZATION_ID))
                .thenReturn(Optional.of(organization));

        when(
                membershipRepository
                        .existsByUserUserIdAndOrganizationOrganizationId(
                                USER_ID,
                                ORGANIZATION_ID
                        )
        ).thenReturn(true);

        assertThrows(
                MembershipAlreadyExistsException.class,
                () -> membershipService.createMembership(
                        USER_EMAIL,
                        ORGANIZATION_ID,
                        MembershipRole.MEMBER
                )
        );
    }
}