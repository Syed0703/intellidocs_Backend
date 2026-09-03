package com.syed.intellidocs.exception;
import com.syed.intellidocs.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(404);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(OrganizationNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleOrganizationNotFound(OrganizationNotFoundException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(404);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(MembershipAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleMembershipAlreadyExistsException(MembershipAlreadyExistsException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(409);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for(FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        ErrorResponse response = new ErrorResponse();
        response.setStatus(400);
        response.setMessage("Validation Failed");
        response.setErrors(errors);
        return response;
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(401);
        response.setMessage("Invalid email or password");
        return response;
    }

    @ExceptionHandler(KnowledgeBaseAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleKnowledgeBaseAlreadyExistsException(KnowledgeBaseAlreadyExistsException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(409);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDeniedException(AccessDeniedException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(403);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(KnowledgeBaseNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleKnowledgeBaseNotFoundException(KnowledgeBaseNotFoundException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(404);
        response.setMessage(ex.getMessage());
        return response;
    }


    @ExceptionHandler(InvalidDocumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidDocumentException(InvalidDocumentException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(400);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(DocumentAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleDocumentAlreadyExistsException(DocumentAlreadyExistsException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(409);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(PdfProcessingException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handlePdfProcessingException(PdfProcessingException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(422);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(FileStorageException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleFileStorageException(FileStorageException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(500);
        response.setMessage(ex.getMessage());
        return response;
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneralException(Exception ex) {
        ex.printStackTrace();
        ErrorResponse response = new ErrorResponse();
        response.setStatus(500);
        response.setMessage("An unexpected error occurred");
        return response;
    }

    @ExceptionHandler(DocumentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleDocumentNotFoundException(DocumentNotFoundException ex) {
        ErrorResponse response = new ErrorResponse();
        response.setStatus(404);
        response.setMessage(ex.getMessage());
        return response;
    }
}
