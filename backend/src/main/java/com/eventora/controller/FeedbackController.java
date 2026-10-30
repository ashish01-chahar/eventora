package com.eventora.controller;

import com.eventora.dto.EventResponse;
import com.eventora.dto.FeedbackRequest;
import com.eventora.dto.FeedbackResponse;
import com.eventora.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/eligible-events")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EventResponse>> getEligibleEvents(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(feedbackService.getEligibleEvents(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        FeedbackResponse response = feedbackService.submitFeedback(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
