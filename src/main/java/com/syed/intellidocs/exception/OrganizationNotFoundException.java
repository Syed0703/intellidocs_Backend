package com.syed.intellidocs.exception;

public class OrganizationNotFoundException extends RuntimeException{
    public OrganizationNotFoundException () {
        super("Organization not found");
    }
}
