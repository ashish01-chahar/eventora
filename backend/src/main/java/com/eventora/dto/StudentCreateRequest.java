package com.eventora.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class StudentCreateRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    @NotBlank(message = "College email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Enrollment number is required")
    private String enrollmentNumber;

    @NotBlank(message = "Department/Branch is required")
    private String department;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private String password; // Optional initial password (defaults to Student@123 if empty)

    public StudentCreateRequest() {}

    public StudentCreateRequest(String name, String email, String enrollmentNumber, String department, String academicYear, String password) {
        this.name = name;
        this.email = email;
        this.enrollmentNumber = enrollmentNumber;
        this.department = department;
        this.academicYear = academicYear;
        this.password = password;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
