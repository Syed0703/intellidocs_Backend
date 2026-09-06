package com.syed.intellidocs.exception;

public class DocumentProcessingInProgressException extends RuntimeException {
    public DocumentProcessingInProgressException() {
        super("Cannot delete a document while it is being processed");
    }
}
