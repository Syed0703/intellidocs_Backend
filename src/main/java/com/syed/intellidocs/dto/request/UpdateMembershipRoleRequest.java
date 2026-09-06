package com.syed.intellidocs.dto.request;

import com.syed.intellidocs.enums.MembershipRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMembershipRoleRequest {
    @NotNull
    private MembershipRole role;
}
