package com.syed.intellidocs.exception;

public class KnowledgeBaseNotFoundException extends RuntimeException{
    public KnowledgeBaseNotFoundException() {
        super("Knowledge base not found");
    }
}
