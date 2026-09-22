package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CurrentUserResponse {

    private Long userId;
    private String name;
    private String email;
}