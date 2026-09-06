package com.syed.intellidocs.exception;

public class MembershipNotFoundException extends RuntimeException {
    public MembershipNotFoundException() {
        super("Membership not found");
    }
}
