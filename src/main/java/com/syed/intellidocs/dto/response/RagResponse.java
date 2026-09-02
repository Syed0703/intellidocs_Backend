package com.syed.intellidocs.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RagResponse {
    private String answer;
    private List<SourceResponse> sources;
}
