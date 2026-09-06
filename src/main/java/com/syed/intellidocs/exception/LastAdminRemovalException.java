package com.syed.intellidocs.exception;

public class LastAdminRemovalException extends RuntimeException {
    public LastAdminRemovalException() {
        super("Cannot remove the last admin from the organization");
    }
}
