package com.eventora.dto;

import jakarta.validation.constraints.NotBlank;

public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    public AnnouncementRequest() {}

    public AnnouncementRequest(String title, String message) {
        this.title = title;
        this.message = message;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
