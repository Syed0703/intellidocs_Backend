package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ErrorResponse {
    private int status;
    private String message;
    private Map<String, String> errors;
}
