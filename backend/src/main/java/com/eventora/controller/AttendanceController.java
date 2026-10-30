package com.eventora.controller;

import com.eventora.dto.AttendanceResponse;
import com.eventora.dto.AttendanceUpdateRequest;
import com.eventora.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@PreAuthorize("hasRole('ADMIN')")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @PutMapping("/{registrationId}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable String registrationId,
            @Valid @RequestBody AttendanceUpdateRequest request
    ) {
        AttendanceResponse updated = attendanceService.updateAttendance(registrationId, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
