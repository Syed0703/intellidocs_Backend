package com.syed.intellidocs.exception;

public class KnowledgeBaseNotEmptyException extends RuntimeException {

    public KnowledgeBaseNotEmptyException() {
        super("Remove all documents from this knowledge base before deleting it");
    }
}