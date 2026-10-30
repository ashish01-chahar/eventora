package com.eventora.controller;

import com.eventora.dto.EventRequest;
import com.eventora.dto.EventResponse;
import com.eventora.entity.User;
import com.eventora.service.AuthService;
import com.eventora.service.EventService;
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
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final AuthService authService;

    public EventController(EventService eventService, AuthService authService) {
        this.eventService = eventService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents(@AuthenticationPrincipal UserDetails userDetails) {
        String studentCustomId = null;
        if (userDetails != null) {
            try {
                User user = authService.getUserByEmail(userDetails.getUsername());
                studentCustomId = user.getCustomId();
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(eventService.getAllEvents(studentCustomId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String studentCustomId = null;
        if (userDetails != null) {
            try {
                User user = authService.getUserByEmail(userDetails.getUsername());
                studentCustomId = user.getCustomId();
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(eventService.getEvent(id, studentCustomId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "admin-1";
        EventResponse created = eventService.createEvent(request, createdBy);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest request
    ) {
        EventResponse updated = eventService.updateEvent(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully."));
    }
}
