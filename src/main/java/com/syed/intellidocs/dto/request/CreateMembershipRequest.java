package com.syed.intellidocs.dto.request;

import com.syed.intellidocs.enums.MembershipRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMembershipRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotNull(message = "Organization id is required")
    private Long organizationId;

    @NotNull(message = "Role is required")
    private MembershipRole role;
}
