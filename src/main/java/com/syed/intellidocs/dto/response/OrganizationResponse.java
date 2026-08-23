package com.syed.intellidocs.dto.response;

import com.syed.intellidocs.enums.OrganizationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationResponse {
    private Long organizationId;
    private String organizationName;
    private OrganizationStatus status;
}
