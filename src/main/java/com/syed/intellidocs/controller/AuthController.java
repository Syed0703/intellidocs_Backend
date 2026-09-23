package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.CreateLoginRequest;
import com.syed.intellidocs.dto.response.AuthResult;
import com.syed.intellidocs.dto.response.LoginResponse;
import com.syed.intellidocs.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import com.syed.intellidocs.dto.response.CurrentUserResponse;
import com.syed.intellidocs.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.csrf.CsrfToken;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public AuthController(
            AuthService authService,
            @Value("${app.cookie.secure}") boolean cookieSecure,
            @Value("${app.cookie.same-site}") String cookieSameSite
    ) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody CreateLoginRequest request,
            HttpServletResponse response
    ) {
        AuthResult authResult =  authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", authResult.getToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(30 * 60)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return authResult.getResponse();
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser(
            Authentication authentication
    ) {

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        CurrentUserResponse response =
                new CurrentUserResponse();

        response.setUserId(userDetails.getUserId());
        response.setName(userDetails.getName());
        response.setEmail(userDetails.getUsername());

        return response;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }
}
