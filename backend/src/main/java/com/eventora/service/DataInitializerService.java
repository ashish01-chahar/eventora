package com.eventora.service;

import com.eventora.entity.Announcement;
import com.eventora.entity.Event;
import com.eventora.entity.Role;
import com.eventora.entity.User;
import com.eventora.repository.AnnouncementRepository;
import com.eventora.repository.EventRepository;
import com.eventora.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializerService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializerService(
            UserRepository userRepository,
            EventRepository eventRepository,
            AnnouncementRepository announcementRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedEvents();
        seedAnnouncements();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@eventora.com")) {
            User admin = new User(
                    "admin-1",
                    "Eventora Admin",
                    "admin@eventora.com",
                    passwordEncoder.encode("admin123"),
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("student@eventora.com")) {
            User student = new User(
                    "student-1",
                    "Demo Student",
                    "student@eventora.com",
                    passwordEncoder.encode("student123"),
                    Role.ROLE_STUDENT,
                    "ENR2026CS001",
                    "Computer Science & Engineering",
                    "3rd Year"
            );
            userRepository.save(student);
        }
    }

    private void seedEvents() {
        if (eventRepository.count() == 0) {
            LocalDate today = LocalDate.now();

            eventRepository.save(new Event(
                    "EVT-101",
                    "TechNova Innovation Summit",
                    "Technical",
                    today.plusDays(7),
                    "10:00",
                    "Main Auditorium",
                    150,
                    "Explore emerging technologies, innovation and student-led projects.",
                    "admin-1"
            ));

            eventRepository.save(new Event(
                    "EVT-102",
                    "Cultural Fusion Fest",
                    "Cultural",
                    today.plusDays(12),
                    "14:00",
                    "College Ground",
                    300,
                    "Celebrate music, dance, creativity and the diversity of campus life.",
                    "admin-1"
            ));

            eventRepository.save(new Event(
                    "EVT-103",
                    "AI & Data Science Workshop",
                    "Workshop",
                    today.plusDays(16),
                    "11:00",
                    "Computer Lab 2",
                    80,
                    "Learn practical concepts in AI, data analysis and machine learning.",
                    "admin-1"
            ));

            eventRepository.save(new Event(
                    "EVT-104",
                    "Campus Sports Meet",
                    "Sports",
                    today.plusDays(20),
                    "09:00",
                    "Sports Complex",
                    200,
                    "Join your fellow students for a day of games and friendly competition.",
                    "admin-1"
            ));

            eventRepository.save(new Event(
                    "EVT-105",
                    "Web Development Bootcamp",
                    "Technical",
                    today.plusDays(24),
                    "10:30",
                    "Seminar Hall",
                    100,
                    "Build your web development foundation through a hands-on session.",
                    "admin-1"
            ));

            eventRepository.save(new Event(
                    "EVT-106",
                    "Creative Minds Workshop",
                    "Workshop",
                    today.plusDays(30),
                    "12:00",
                    "Innovation Centre",
                    60,
                    "Develop creative thinking and turn ideas into practical projects.",
                    "admin-1"
            ));
        }
    }

    private void seedAnnouncements() {
        if (announcementRepository.count() == 0) {
            announcementRepository.save(new Announcement(
                    "ANN-101",
                    "Welcome to Eventora",
                    "Explore campus events, register for activities and share your feedback through Eventora.",
                    "admin-1"
            ));

            announcementRepository.save(new Announcement(
                    "ANN-102",
                    "Stay Updated",
                    "Check the events section regularly for new workshops, cultural activities and technical events.",
                    "admin-1"
            ));
        }
    }
}
