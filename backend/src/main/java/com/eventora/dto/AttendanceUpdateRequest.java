package com.eventora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AttendanceUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "Pending|Present|Absent", message = "Status must be Pending, Present, or Absent")
    private String status;

    public AttendanceUpdateRequest() {}

    public AttendanceUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
