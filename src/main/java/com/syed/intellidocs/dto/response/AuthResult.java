package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResult {
    private LoginResponse response;
    private String token;
}
