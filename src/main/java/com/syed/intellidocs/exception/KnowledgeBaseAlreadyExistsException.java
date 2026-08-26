package com.syed.intellidocs.exception;

public class KnowledgeBaseAlreadyExistsException extends RuntimeException{
    public KnowledgeBaseAlreadyExistsException() {
        super("Knowledge base already exists");
    }
}
