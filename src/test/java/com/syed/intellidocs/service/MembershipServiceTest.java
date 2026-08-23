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
    public class MembershipServiceTest {

        @Mock
        UserRepository userRepository;

        @Mock
        OrganizationRepository organizationRepository;

        @Mock
        MembershipRepository membershipRepository;

        @InjectMocks
        MembershipService membershipService;

        @Test
        void createMembership_shouldCreateMembership() {
            User user = new User();
            Organization organization = new Organization();

            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(user));

            when(organizationRepository.findById(1L))
                    .thenReturn(Optional.of(organization));

            when(membershipRepository
                    .existsByUserUserIdAndOrganizationOrganizationId(1L, 1L))
                    .thenReturn(false);

            Membership result = membershipService
                    .createMembership(1L, 1L, MembershipRole.MEMBER);

            assertEquals(user, result.getUser());
            assertEquals(organization, result.getOrganization());
            assertEquals(MembershipRole.MEMBER, result.getRole());

            verify(membershipRepository).save(any(Membership.class));
        }

        @Test
        void createMembership_shouldThrowWhenUserDoesNotExist() {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.empty());

            assertThrows(
                    UserNotFoundException.class,
                    () -> membershipService
                            .createMembership(1L, 1L, MembershipRole.MEMBER)
            );
        }

        @Test
        void createMembership_shouldThrowWhenOrganizationDoesNotExist() {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(new User()));

            when(organizationRepository.findById(1L))
                    .thenReturn(Optional.empty());

            assertThrows(
                    OrganizationNotFoundException.class,
                    () -> membershipService
                            .createMembership(1L, 1L, MembershipRole.MEMBER)
                    );
        }

        @Test
        void createMembership_shouldThrowWhenMembershipAlreadyExist() {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(new User()));

            when(organizationRepository.findById(1L))
                    .thenReturn(Optional.of(new Organization()));

            when(membershipRepository
                    .existsByUserUserIdAndOrganizationOrganizationId(1L, 1L))
                    .thenReturn(true);

            assertThrows(
                    MembershipAlreadyExistsException.class,
                    () -> membershipService
                            .createMembership(1L, 1L, MembershipRole.MEMBER)
                    );
        }
    }
