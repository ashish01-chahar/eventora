-- ==============================================================================
-- EVENTORA DATABASE INITIALIZATION SCRIPT (MySQL 8 / 9)
-- Run this script in MySQL Workbench or via MySQL Command Line Client:
-- mysql -u root -p < setup.sql
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS eventora_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE eventora_db;

-- Table schemas are automatically created and updated by Hibernate (ddl-auto=update).
-- The reference schema for MySQL is provided below:

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enrollment_number VARCHAR(100) UNIQUE,
    department VARCHAR(255),
    academic_year VARCHAR(50),
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    event_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    registration_date DATETIME NOT NULL,
    CONSTRAINT uk_event_student UNIQUE (event_id, student_id),
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    registration_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_att_reg FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    event_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    submitted_at DATETIME NOT NULL,
    CONSTRAINT uk_feedback_event_student UNIQUE (event_id, student_id),
    CONSTRAINT fk_fb_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_fb_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    custom_id VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    published_date DATETIME NOT NULL,
    created_by VARCHAR(255)
);

-- Display confirmation
SELECT 'Database eventora_db and schema structures are verified.' AS status;
