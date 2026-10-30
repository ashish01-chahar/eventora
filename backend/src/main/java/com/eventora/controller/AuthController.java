package com.eventora.controller;

import com.eventora.dto.AuthRequest;
import com.eventora.dto.AuthResponse;
import com.eventora.entity.User;
import com.eventora.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(Map.of(
                "id", user.getCustomId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().getRoleName()
        ));
    }
}
