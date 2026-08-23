package com.syed.intellidocs.service;

import com.syed.intellidocs.dto.request.CreateUserRequest;
import com.syed.intellidocs.dto.response.UserResponse;
import com.syed.intellidocs.entity.User;
import com.syed.intellidocs.enums.UserStatus;
import com.syed.intellidocs.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();
        response.setUserId(savedUser.getUserId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setStatus(savedUser.getStatus());

        return response;
    }
}
