package com.eventora.service;

import com.eventora.dto.StudentCreateRequest;
import com.eventora.dto.StudentResponse;
import com.eventora.entity.Role;
import com.eventora.entity.User;
import com.eventora.exception.BadRequestException;
import com.eventora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String enrollmentNumber = request.getEnrollmentNumber().trim().toUpperCase();

        // 1. Prevent duplicate email addresses
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("A user with this email address already exists: " + email);
        }

        // 2. Prevent duplicate enrollment numbers
        if (userRepository.existsByEnrollmentNumber(enrollmentNumber)) {
            throw new BadRequestException("A student with this enrollment number already exists: " + enrollmentNumber);
        }

        // 3. Resolve initial password (default to Student@123 if not provided)
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "Student@123";

        // 4. Hash password with BCrypt
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // 5. Create student entity with ROLE_STUDENT
        String customId = "student-" + System.currentTimeMillis();
        User student = new User(
                customId,
                request.getName().trim(),
                email,
                encodedPassword,
                Role.ROLE_STUDENT,
                enrollmentNumber,
                request.getDepartment().trim(),
                request.getAcademicYear().trim()
        );

        User saved = userRepository.save(student);

        return new StudentResponse(
                saved.getCustomId(),
                saved.getName(),
                saved.getEmail(),
                saved.getEnrollmentNumber(),
                saved.getDepartment(),
                saved.getAcademicYear(),
                saved.getRole().getRoleName(),
                rawPassword
        );
    }

    public List<StudentResponse> getAllStudents() {
        return userRepository.findByRole(Role.ROLE_STUDENT).stream()
                .map(s -> new StudentResponse(
                        s.getCustomId(),
                        s.getName(),
                        s.getEmail(),
                        s.getEnrollmentNumber(),
                        s.getDepartment(),
                        s.getAcademicYear(),
                        s.getRole().getRoleName(),
                        null
                ))
                .collect(Collectors.toList());
    }
}
