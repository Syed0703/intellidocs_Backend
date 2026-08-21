package com.syed.intellidocs.dto.request;

import com.syed.intellidocs.enums.MembershipRole;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class CreateMembershipRequest {
    private Long userId;
    private Long organizationId;
    private MembershipRole role;
}
