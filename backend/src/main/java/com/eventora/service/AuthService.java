package com.eventora.service;

import com.eventora.dto.AuthRequest;
import com.eventora.dto.AuthResponse;
import com.eventora.entity.Role;
import com.eventora.entity.User;
import com.eventora.exception.BadRequestException;
import com.eventora.exception.UnauthorizedException;
import com.eventora.repository.UserRepository;
import com.eventora.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email, password or account type."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email, password or account type.");
        }

        // Validate requested role if provided
        if (request.getRole() != null && !request.getRole().isBlank()) {
            Role requestedRole = Role.fromString(request.getRole());
            if (user.getRole() != requestedRole) {
                throw new UnauthorizedException("Account type does not match. Please select the correct role.");
            }
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token,
                user.getCustomId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found."));
    }
}
