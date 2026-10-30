package com.eventora.service;

import com.eventora.dto.RegistrationResponse;
import com.eventora.entity.Event;
import com.eventora.entity.Role;
import com.eventora.entity.User;
import com.eventora.exception.BadRequestException;
import com.eventora.repository.AttendanceRepository;
import com.eventora.repository.EventRepository;
import com.eventora.repository.RegistrationRepository;
import com.eventora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class RegistrationServiceTest {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    private User testStudent;
    private Event testEvent;

    @BeforeEach
    void setUp() {
        testStudent = userRepository.findByEmail("student@eventora.com").orElseGet(() -> {
            User s = new User("test-std", "Test Student", "student@eventora.com", "pass", Role.ROLE_STUDENT);
            return userRepository.save(s);
        });

        testEvent = new Event(
                "TEST-EVT-1",
                "Test Hackathon",
                "Technical",
                LocalDate.now().plusDays(5),
                "09:00",
                "Hall A",
                1, // Capacity is 1 to test capacity limits!
                "Description",
                "admin-1"
        );
        testEvent = eventRepository.save(testEvent);
    }

    @Test
    void testSuccessfulRegistration() {
        RegistrationResponse resp = registrationService.registerForEvent(testEvent.getCustomId(), testStudent.getEmail());

        assertNotNull(resp);
        assertEquals(testEvent.getCustomId(), resp.getEventId());
        assertEquals(testStudent.getCustomId(), resp.getStudentId());

        // Verify attendance record was created automatically
        assertEquals(1, attendanceRepository.count());
    }

    @Test
    void testDuplicateRegistrationThrowsBadRequest() {
        registrationService.registerForEvent(testEvent.getCustomId(), testStudent.getEmail());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                registrationService.registerForEvent(testEvent.getCustomId(), testStudent.getEmail())
        );

        assertTrue(ex.getMessage().contains("already registered"));
    }

    @Test
    void testCapacityEnforcementThrowsBadRequest() {
        // First registration fills capacity (capacity is 1)
        registrationService.registerForEvent(testEvent.getCustomId(), testStudent.getEmail());

        // Second student attempts to register
        User student2 = new User("std-2", "Student Two", "student2@test.com", "pass", Role.ROLE_STUDENT);
        userRepository.save(student2);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                registrationService.registerForEvent(testEvent.getCustomId(), student2.getEmail())
        );

        assertTrue(ex.getMessage().contains("event is full"));
    }

    @Test
    void testRegistrationForPastEventThrowsBadRequest() {
        Event pastEvent = new Event(
                "PAST-EVT",
                "Past Event",
                "Cultural",
                LocalDate.now().minusDays(2), // In the past!
                "10:00",
                "Hall B",
                10,
                "Description",
                "admin-1"
        );
        eventRepository.save(pastEvent);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                registrationService.registerForEvent(pastEvent.getCustomId(), testStudent.getEmail())
        );

        assertTrue(ex.getMessage().contains("Registration is closed"));
    }

    @Test
    void testCancelRegistration() {
        registrationService.registerForEvent(testEvent.getCustomId(), testStudent.getEmail());
        assertEquals(1, registrationRepository.count());

        registrationService.cancelRegistration(testEvent.getCustomId(), testStudent.getEmail());
        assertEquals(0, registrationRepository.count());
        assertEquals(0, attendanceRepository.count());
    }
}
