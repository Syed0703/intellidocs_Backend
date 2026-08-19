package com.syed.intellidocs.exception;

public class MembershipAlreadyExistsException extends RuntimeException {
    public MembershipAlreadyExistsException() {
        super("Membership already exists");
    }
}
