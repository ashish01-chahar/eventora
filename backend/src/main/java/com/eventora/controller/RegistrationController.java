package com.eventora.controller;

import com.eventora.dto.RegistrationRequest;
import com.eventora.dto.RegistrationResponse;
import com.eventora.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/api/registrations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponse> register(
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RegistrationResponse response = registrationService.registerForEvent(request.getEventId(), userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/api/registrations/{eventId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> cancelRegistration(
            @PathVariable String eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        registrationService.cancelRegistration(eventId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Registration cancelled successfully."));
    }

    @GetMapping("/api/registrations/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(registrationService.getMyRegistrations(userDetails.getUsername()));
    }

    @GetMapping("/api/participants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getAllParticipants() {
        return ResponseEntity.ok(registrationService.getAllParticipants());
    }
}
