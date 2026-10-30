package com.eventora.dto;

import jakarta.validation.constraints.NotBlank;

public class RegistrationRequest {

    @NotBlank(message = "Event ID is required")
    private String eventId;

    public RegistrationRequest() {}

    public RegistrationRequest(String eventId) {
        this.eventId = eventId;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
}
