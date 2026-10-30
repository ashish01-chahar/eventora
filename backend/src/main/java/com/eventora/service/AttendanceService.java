package com.eventora.service;

import com.eventora.dto.AttendanceResponse;
import com.eventora.entity.Attendance;
import com.eventora.entity.Registration;
import com.eventora.exception.ResourceNotFoundException;
import com.eventora.repository.AttendanceRepository;
import com.eventora.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RegistrationRepository registrationRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, RegistrationRepository registrationRepository) {
        this.attendanceRepository = attendanceRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<AttendanceResponse> getAllAttendance() {
        // Return attendance for all existing registrations
        List<Registration> registrations = registrationRepository.findAll();
        return registrations.stream().map(registration -> {
            Attendance att = attendanceRepository.findByRegistration(registration)
                    .orElseGet(() -> {
                        Attendance newAtt = new Attendance("ATT-" + System.currentTimeMillis(), registration, "Pending");
                        return attendanceRepository.save(newAtt);
                    });
            return toResponse(att);
        }).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceResponse updateAttendance(String registrationCustomId, String newStatus) {
        Registration registration = registrationRepository.findByCustomId(registrationCustomId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with ID: " + registrationCustomId));

        Attendance attendance = attendanceRepository.findByRegistration(registration)
                .orElseGet(() -> new Attendance("ATT-" + System.currentTimeMillis(), registration, "Pending"));

        attendance.setStatus(newStatus);
        attendance.setUpdatedAt(LocalDateTime.now());
        Attendance saved = attendanceRepository.save(attendance);

        return toResponse(saved);
    }

    private AttendanceResponse toResponse(Attendance att) {
        AttendanceResponse resp = new AttendanceResponse();
        resp.setId(att.getCustomId());
        resp.setRegistrationId(att.getRegistration().getCustomId());
        resp.setEventId(att.getRegistration().getEvent().getCustomId());
        resp.setEventTitle(att.getRegistration().getEvent().getTitle());
        resp.setStudentId(att.getRegistration().getStudent().getCustomId());
        resp.setStudentName(att.getRegistration().getStudentName());
        resp.setStudentEmail(att.getRegistration().getStudentEmail());
        resp.setStatus(att.getStatus());
        resp.setUpdatedAt(att.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return resp;
    }
}
