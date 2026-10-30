package com.eventora.dto;

public class StudentResponse {

    private String id;
    private String name;
    private String email;
    private String enrollmentNumber;
    private String department;
    private String academicYear;
    private String role;
    private String temporaryPassword;

    public StudentResponse() {}

    public StudentResponse(String id, String name, String email, String enrollmentNumber, String department, String academicYear, String role, String temporaryPassword) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.enrollmentNumber = enrollmentNumber;
        this.department = department;
        this.academicYear = academicYear;
        this.role = role;
        this.temporaryPassword = temporaryPassword;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTemporaryPassword() { return temporaryPassword; }
    public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
}
