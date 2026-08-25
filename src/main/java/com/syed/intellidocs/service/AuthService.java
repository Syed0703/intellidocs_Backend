package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateLoginRequest;
import com.syed.intellidocs.dto.response.AuthResult;
import com.syed.intellidocs.dto.response.LoginResponse;
import com.syed.intellidocs.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResult login(CreateLoginRequest request) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
        );

        Authentication authentication =  authenticationManager.authenticate(token);

        String jwt = jwtService.generateToken(authentication.getName());

        LoginResponse response = new LoginResponse();
        response.setEmail(authentication.getName());
        response.setAuthenticated(authentication.isAuthenticated());

        AuthResult authResult = new AuthResult();
        authResult.setResponse(response);
        authResult.setToken(jwt);
        return authResult;
    }
}
