package com.syed.intellidocs.exception;
import com.syed.intellidocs.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
    public ErrorResponse handleMembershipAlreadyExist(MembershipAlreadyExistsException ex) {
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

}
