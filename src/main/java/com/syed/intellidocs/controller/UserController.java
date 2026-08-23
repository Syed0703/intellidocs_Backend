package com.syed.intellidocs.controller;

import com.syed.intellidocs.dto.request.CreateUserRequest;
import com.syed.intellidocs.dto.response.UserResponse;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }
}
