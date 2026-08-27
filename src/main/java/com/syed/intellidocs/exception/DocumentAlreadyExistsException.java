package com.syed.intellidocs.exception;

public class DocumentAlreadyExistsException extends RuntimeException{
    public DocumentAlreadyExistsException() {
        super("Document already exists in this knowledge base");
    }
}
