package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateOrganizationRequest;
import com.syed.intellidocs.dto.response.OrganizationResponse;
import com.syed.intellidocs.entity.Organization;
import com.syed.intellidocs.enums.OrganizationStatus;
import com.syed.intellidocs.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        Organization organization = new Organization();
        organization.setOrganizationName(request.getOrganizationName());
        organization.setStatus(OrganizationStatus.ACTIVE);

        Organization savedOrganization = organizationRepository.save(organization);

        OrganizationResponse response = new OrganizationResponse();
        response.setOrganizationId(savedOrganization.getOrganizationId());
        response.setOrganizationName(savedOrganization.getOrganizationName());
        response.setStatus(savedOrganization.getStatus());

        return response;
    }
}
