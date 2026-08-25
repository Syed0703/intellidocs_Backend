package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.CreateLoginRequest;
import com.syed.intellidocs.dto.response.AuthResult;
import com.syed.intellidocs.dto.response.LoginResponse;
import com.syed.intellidocs.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody CreateLoginRequest request,
            HttpServletResponse response
    ) {
        AuthResult authResult =  authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", authResult.getToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/")
                .maxAge(15 * 60)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return authResult.getResponse();
    }
}
