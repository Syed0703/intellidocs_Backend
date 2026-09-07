package com.syed.intellidocs.dto.request;

import com.syed.intellidocs.enums.MembershipRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMembershipRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Organization id is required")
    private Long organizationId;

    @NotNull(message = "Role is required")
    private MembershipRole role;
}
