package com.syed.intellidocs.dto.response;

import com.syed.intellidocs.enums.UserStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long userId;
    private String name;
    private String email;
    private UserStatus status;
}
