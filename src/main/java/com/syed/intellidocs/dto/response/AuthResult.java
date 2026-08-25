package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private LoginResponse response;
    private String token;
}
