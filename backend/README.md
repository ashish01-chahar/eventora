# Eventora Full-Stack Application

Eventora is an enterprise campus event management application built with:
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+), with dynamic Chart.js data visualizations.
- **Backend**: Spring Boot 3.4.2 on Java 21+ with Spring Security 6, JJWT 0.12.6, and Spring Data JPA.
- **Database**: MySQL 9.7 (with persistent local dev profile fallback).

---

## 1. Quick Start Commands (Windows 11 PowerShell)

### Run the Backend

#### Option A: Running with MySQL 9.7 (Recommended for Production)
1. Initialize the database (run once in PowerShell):
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS eventora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
2. Start the backend:
   ```powershell
   cd e:\abyss\4zip\backend
   $env:DB_PASSWORD="your_mysql_password_here"
   .\mvnw.cmd spring-boot:run
   ```

#### Option B: Zero-Config Persistent Local Run (Instant Start)
If you wish to run immediately without typing MySQL credentials:
```powershell
cd e:\abyss\4zip\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The backend starts at: **`http://localhost:8080`**

---

### Run the Frontend

Open a separate PowerShell window:
```powershell
cd e:\abyss\4zip\4
python -m http.server 5500
```
Open your browser at: **`http://localhost:5500`**

---

## 2. Default Seeded Credentials

| Account Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eventora.com` | `admin123` | Event CRUD, Participant management, Attendance marking, Announcement publishing, Analytics dashboard. |
| **Student** | `student@eventora.com` | `student123` | Event browsing, Event registration & cancellation, My Registrations, Event feedback & star ratings. |

*(All passwords are automatically hashed with BCrypt on initial startup.)*

---

## 3. Running Automated Tests

Run the full automated test suite (including capacity limits, concurrency locks, duplicate prevention, and security checks):
```powershell
cd e:\abyss\4zip\backend
.\mvnw.cmd clean test
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Validates credentials and returns JWT Bearer token |
| `GET` | `/api/auth/me` | Authenticated | Returns logged-in user profile |
| `POST` | `/api/admin/students` | Admin | Creates student account with enrollment, branch, year and credentials |
| `GET` | `/api/admin/students` | Admin | Lists all registered student accounts |
| `GET` | `/api/events` | Public | Lists all campus events with registration counts |
| `POST` | `/api/events` | Admin | Creates a new event |
| `PUT` | `/api/events/{id}` | Admin | Updates an event |
| `DELETE` | `/api/events/{id}` | Admin | Deletes an event and cascade-deletes related registrations |
| `GET` | `/api/registrations/my` | Student | Lists registered events for the logged-in student |
| `POST` | `/api/registrations` | Student | Registers for an event (concurrency-safe capacity check) |
| `DELETE` | `/api/registrations/{eventId}` | Student | Cancels event registration |
| `GET` | `/api/participants` | Admin | Lists all registered students across all events |
| `GET` | `/api/attendance` | Admin | Lists all registrations with attendance statuses |
| `PUT` | `/api/attendance/{regId}` | Admin | Updates status (`Pending`, `Present`, `Absent`) |
| `GET` | `/api/announcements` | Public | Lists announcements ordered by date |
| `POST` | `/api/announcements` | Admin | Publishes a campus announcement |
| `GET` | `/api/feedback/eligible-events` | Student | Lists registered events eligible for feedback |
| `POST` | `/api/feedback` | Student | Submits 1-5 star rating and comment |
| `GET` | `/api/analytics` | Admin | Computes KPI counts, attendance rate %, and chart data |
