package com.eventora.service;

import com.eventora.dto.RegistrationResponse;
import com.eventora.entity.Attendance;
import com.eventora.entity.Event;
import com.eventora.entity.Registration;
import com.eventora.entity.User;
import com.eventora.exception.BadRequestException;
import com.eventora.exception.ResourceNotFoundException;
import com.eventora.repository.AttendanceRepository;
import com.eventora.repository.EventRepository;
import com.eventora.repository.RegistrationRepository;
import com.eventora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public RegistrationService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            AttendanceRepository attendanceRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RegistrationResponse registerForEvent(String eventCustomId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + studentEmail));

        // Concurrency-Safe Pessimistic Write Lock on Event
        Event event = eventRepository.findByCustomIdForUpdate(eventCustomId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventCustomId));

        // 1. Check if event date has already passed
        if (event.getDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Registration is closed for this event.");
        }

        // 2. Check if student is already registered
        if (registrationRepository.existsByEventAndStudent(event, student)) {
            throw new BadRequestException("You are already registered for this event.");
        }

        // 3. Concurrency-safe capacity check
        long currentRegistrations = registrationRepository.countByEvent(event);
        if (currentRegistrations >= event.getCapacity()) {
            throw new BadRequestException("Sorry, this event is full.");
        }

        // 4. Create and save registration
        String regCustomId = "REG-" + System.currentTimeMillis();
        Registration registration = new Registration(regCustomId, event, student);
        Registration savedRegistration = registrationRepository.save(registration);

        // 5. Automatically create an initial attendance entry with "Pending" status
        String attCustomId = "ATT-" + System.currentTimeMillis();
        Attendance attendance = new Attendance(attCustomId, savedRegistration, "Pending");
        attendanceRepository.save(attendance);

        return toResponse(savedRegistration);
    }

    @Transactional
    public void cancelRegistration(String eventCustomId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));

        Event event = eventRepository.findByCustomId(eventCustomId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found."));

        Registration registration = registrationRepository.findByEventAndStudent(event, student)
                .orElseThrow(() -> new ResourceNotFoundException("Active registration not found for this event."));

        // Delete attendance first
        attendanceRepository.findByRegistration(registration)
                .ifPresent(attendanceRepository::delete);

        // Delete registration
        registrationRepository.delete(registration);
    }

    public List<RegistrationResponse> getMyRegistrations(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));

        List<Registration> registrations = registrationRepository.findByStudentOrderByRegistrationDateDesc(student);
        return registrations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RegistrationResponse> getAllParticipants() {
        List<Registration> registrations = registrationRepository.findAll();
        return registrations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RegistrationResponse toResponse(Registration reg) {
        RegistrationResponse resp = new RegistrationResponse();
        resp.setId(reg.getCustomId());
        resp.setEventId(reg.getEvent().getCustomId());
        resp.setEventTitle(reg.getEvent().getTitle());
        resp.setEventCategory(reg.getEvent().getCategory());
        resp.setEventDate(reg.getEvent().getDate().toString());
        resp.setEventVenue(reg.getEvent().getVenue());
        resp.setStudentId(reg.getStudent().getCustomId());
        resp.setStudentName(reg.getStudentName());
        resp.setStudentEmail(reg.getStudentEmail());
        resp.setRegistrationDate(reg.getRegistrationDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return resp;
    }
}
