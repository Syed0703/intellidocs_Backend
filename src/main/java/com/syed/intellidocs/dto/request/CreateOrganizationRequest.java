package com.syed.intellidocs.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrganizationRequest {
    @NotBlank
    private String organizationName;
}
