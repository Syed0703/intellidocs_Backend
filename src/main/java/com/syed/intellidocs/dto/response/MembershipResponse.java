package com.syed.intellidocs.dto.response;

import com.syed.intellidocs.enums.MembershipRole;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MembershipResponse {
    private Long membershipId;
    private MembershipRole role;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long organizationId;
    private String organizationName;
    private LocalDateTime joinedAt;

}
