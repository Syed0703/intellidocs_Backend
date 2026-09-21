package com.syed.intellidocs.exception;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException() {
        super("Email is already registered");
    }
}