"use strict";

/*
    EVENTORA - FULL STACK CONNECTED CLIENT
    Connected to Spring Boot 3 + MySQL Backend at http://localhost:8080/api

    Features:
    - Secure JWT Authentication
    - Server-Side Role-Based Authorization (Student & Admin)
    - Concurrency-safe Event Management & Capacity Limits
    - Real-time Participant & Attendance Tracking
    - Campus Announcements & Feedback
    - Chart.js Analytics & Visualizations
*/

// --------------------------------------------------
// 1. CONFIGURATION & DOM HELPERS
// --------------------------------------------------

const API_BASE_URL = "http://localhost:8080/api";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let currentUser = null;
let cachedEvents = [];

let dashboardChart = null;
let popularityChart = null;
let categoryChart = null;

let toastTimer = null;

// --------------------------------------------------
// 2. HTTP CLIENT WITH JWT INTERCEPTOR
// --------------------------------------------------

async function apiRequest(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = localStorage.getItem("eventora_jwt_token");
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle Session Expiration / Unauthorized
        if (response.status === 401) {
            if (currentUser) {
                handleLogout();
                showToast("Session expired. Please sign in again.");
            }
            const errBody = await response.json().catch(() => null);
            const msg = errBody?.message || "Invalid credentials or unauthorized.";
            throw new Error(msg);
        }

        // Handle Forbidden Access
        if (response.status === 403) {
            showToast("Access forbidden: you do not have permission for this action.");
            throw new Error("Access forbidden");
        }

        // Handle Empty Response (e.g. 204 No Content)
        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || data?.error || ("Server request failed (Status " + response.status + ")");
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
            console.error("Backend Connection Error:", error);
            throw new Error("Cannot connect to backend server at " + API_BASE_URL + ". Is Spring Boot running?");
        }
        throw error;
    }
}

// --------------------------------------------------
// 3. GENERAL HELPERS
// --------------------------------------------------

function escapeHTML(value = "") {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    return String(value).replace(/[&<>"']/g, char => map[char]);
}

function formatDate(dateString) {
    if (!dateString) return "Date unavailable";
    const date = new Date(dateString + "T00:00:00");
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function eventIsUpcoming(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(event.date + "T00:00:00") >= today;
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}

// --------------------------------------------------
// 4. AUTHENTICATION & SESSION
// --------------------------------------------------

$$(".role-btn").forEach(button => {
    button.addEventListener("click", () => {
        $$(".role-btn").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        $("#selectedRole").value = button.dataset.role;
        $("#loginMessage").textContent = "";
    });
});

$("#togglePassword").addEventListener("click", () => {
    const password = $("#password");
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    $("#togglePassword").textContent = isHidden ? "Hide" : "Show";
});

$("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    const email = $("#email").value.trim().toLowerCase();
    const password = $("#password").value;
    const selectedRole = $("#selectedRole").value;

    const loginBtn = $("#loginForm button[type='submit']");
    const originalBtnText = loginBtn.innerHTML;

    $("#loginMessage").textContent = "";
    loginBtn.disabled = true;
    loginBtn.innerHTML = "Signing in...";

    try {
        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password, role: selectedRole })
        });

        localStorage.setItem("eventora_jwt_token", response.token);
        currentUser = {
            id: response.id,
            name: response.name,
            email: response.email,
            role: response.role
        };
        localStorage.setItem("eventora_user", JSON.stringify(currentUser));

        $("#loginForm").reset();
        $("#selectedRole").value = selectedRole;
        $("#password").type = "password";
        $("#togglePassword").textContent = "Show";

        openApplication();
        showToast("Welcome back, " + currentUser.name + "!");
    } catch (error) {
        $("#loginMessage").textContent = error.message;
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnText;
    }
});

function handleLogout() {
    currentUser = null;
    localStorage.removeItem("eventora_jwt_token");
    localStorage.removeItem("eventora_user");

    $("#app").classList.add("hidden");
    $("#loginPage").classList.remove("hidden");
    $("#loginMessage").textContent = "";

    $("#email").value = "";
    $("#password").value = "";
    $("#selectedRole").value = "student";

    $$(".role-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.role === "student");
    });
}

$("#logoutBtn").addEventListener("click", handleLogout);

function openApplication() {
    $("#loginPage").classList.add("hidden");
    $("#app").classList.remove("hidden");

    $("#profileName").textContent = currentUser.name;
    $("#profileRole").textContent =
        currentUser.role === "admin" ? "Administrator" : "Student Account";
    $("#profileAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();

    const isAdmin = currentUser.role === "admin";

    $$(".admin-only").forEach(el => el.classList.toggle("hidden", !isAdmin));
    $$(".student-only").forEach(el => el.classList.toggle("hidden", isAdmin));

    $("#welcomeHeading").textContent =
        isAdmin ? "Welcome back, Admin!" : "Welcome to Eventora!";
    $("#welcomeDescription").textContent =
        isAdmin
            ? "Manage events, monitor participation and explore campus insights."
            : "Discover experiences that bring your campus to life.";

    navigateTo("dashboard");
    refreshApplication();
}

// --------------------------------------------------
// 5. NAVIGATION
// --------------------------------------------------

const PAGE_TITLES = {
    dashboard: "Dashboard",
    events: "Explore Events",
    registrations: "My Registrations",
    participants: "Participants",
    attendance: "Attendance Management",
    announcements: "Announcements",
    analytics: "Event Analytics",
    feedback: "Event Feedback"
};

function navigateTo(page) {
    if (!currentUser || !PAGE_TITLES[page]) return;

    const adminPages = ["participants", "attendance", "analytics"];
    const studentPages = ["registrations", "feedback"];

    if (currentUser.role !== "admin" && adminPages.includes(page)) {
        showToast("You don't have permission to access this section.");
        return;
    }

    if (currentUser.role !== "student" && studentPages.includes(page)) {
        showToast("This section is available to student accounts.");
        return;
    }

    $$(".page-section").forEach(sec => sec.classList.add("hidden"));
    const targetSection = $("#" + page + "Section");
    if (targetSection) targetSection.classList.remove("hidden");

    $$(".nav-link").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });

    $("#pageHeading").textContent = PAGE_TITLES[page];
    $("#breadcrumbPage").textContent = PAGE_TITLES[page].toUpperCase();

    if (page === "dashboard") renderDashboard();
    if (page === "events") renderEvents();
    if (page === "registrations") renderRegistrations();
    if (page === "participants") renderParticipants();
    if (page === "attendance") renderAttendance();
    if (page === "announcements") renderAnnouncements();
    if (page === "analytics") renderAnalytics();
    if (page === "feedback") renderFeedbackOptions();
}

$$(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
});

$$("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.goto));
});

async function refreshApplication() {
    await renderDashboard();
    await renderEvents();
}

// --------------------------------------------------
// 6. DASHBOARD MODULE
// --------------------------------------------------

async function renderDashboard() {
    try {
        const events = await apiRequest("/events");
        cachedEvents = events;

        let totalReg = 0;
        let attendanceRate = "0%";
        let avgRating = "0.0";

        if (currentUser.role === "admin") {
            try {
                const analytics = await apiRequest("/analytics");
                totalReg = analytics.totalRegistrations;
                attendanceRate = analytics.attendanceRate + "%";
                avgRating = analytics.averageRating;
            } catch (ignored) {}
        } else {
            try {
                const myRegs = await apiRequest("/registrations/my");
                totalReg = myRegs.length;
                attendanceRate = "100%";
                avgRating = "5.0";
            } catch (ignored) {}
        }

        $("#totalEvents").textContent = events.length;
        $("#totalRegistrations").textContent = totalReg;
        $("#attendanceRate").textContent = attendanceRate;
        $("#averageRating").textContent = avgRating;

        const upcoming = events
            .filter(eventIsUpcoming)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 4);

        const dashboardEvents = $("#dashboardEvents");
        if (!upcoming.length) {
            dashboardEvents.innerHTML = `
                <div class="empty-state">
                    <strong>No upcoming events</strong>
                    Check back later for new campus activities.
                </div>
            `;
        } else {
            dashboardEvents.innerHTML = upcoming.map(event => {
                const date = new Date(event.date + "T00:00:00");
                const day = date.getDate();
                const month = date.toLocaleDateString("en-IN", { month: "short" });

                return `
                    <div class="event-list-item">
                        <div class="event-date-box">
                            <strong>${day}</strong>
                            <span>${escapeHTML(month)}</span>
                        </div>
                        <div class="event-list-info">
                            <strong>${escapeHTML(event.title)}</strong>
                            <p>${escapeHTML(event.category)} · ${escapeHTML(event.venue)}</p>
                        </div>
                    </div>
                `;
            }).join("");
        }

        renderDashboardChart(events.length, totalReg);
    } catch (error) {
        console.error("Dashboard render error:", error);
    }
}

function renderDashboardChart(eventsCount, registrationsCount) {
    const canvas = $("#dashboardChart");
    if (!canvas || typeof Chart === "undefined") return;

    if (dashboardChart) {
        dashboardChart.destroy();
    }

    dashboardChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Events", "Registrations", "Community"],
            datasets: [{
                label: "Total",
                data: [eventsCount, registrationsCount, Math.max(eventsCount + registrationsCount, 1)],
                backgroundColor: ["#7028E4", "#1937A5", "#A68BFA"],
                borderRadius: 7,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

// --------------------------------------------------
// 7. EVENTS MODULE
// --------------------------------------------------

const CATEGORY_SYMBOLS = {
    Technical: "⌘",
    Cultural: "♫",
    Sports: "⚽",
    Workshop: "✦",
    Other: "◇"
};

async function renderEvents() {
    const grid = $("#eventsGrid");
    if (!grid) return;

    try {
        const events = await apiRequest("/events");
        cachedEvents = events;

        const search = ($("#eventSearch")?.value || "").trim().toLowerCase();
        const category = $("#categoryFilter")?.value || "all";

        const filtered = events.filter(event => {
            const matchesSearch =
                event.title.toLowerCase().includes(search) ||
                event.description.toLowerCase().includes(search) ||
                event.venue.toLowerCase().includes(search);

            const matchesCategory = category === "all" || event.category === category;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.date.localeCompare(b.date));

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="empty-state">
                    <strong>No events found</strong>
                    Try another search or category.
                </div>
            `;
            return;
        }

        const isAdmin = currentUser?.role === "admin";

        grid.innerHTML = filtered.map(event => {
            const full = event.registeredCount >= Number(event.capacity);
            const isEnded = !eventIsUpcoming(event);

            let actionButtons = "";
            if (isAdmin) {
                actionButtons = `
                    <button class="secondary-btn" data-edit-event="${escapeHTML(event.id)}">
                        Edit
                    </button>
                    <button class="danger-btn" data-delete-event="${escapeHTML(event.id)}">
                        Delete
                    </button>
                `;
            } else {
                if (event.alreadyRegistered) {
                    actionButtons = `
                        <button class="secondary-btn" data-cancel-registration="${escapeHTML(event.id)}">
                            Cancel Registration
                        </button>
                    `;
                } else {
                    actionButtons = `
                        <button class="primary-btn" data-register-event="${escapeHTML(event.id)}"
                            ${full || isEnded ? "disabled" : ""}>
                            ${isEnded ? "Event Ended" : full ? "Event Full" : "Register Now →"}
                        </button>
                    `;
                }
            }

            return `
                <article class="event-card">
                    <div class="event-card-banner">
                        <span class="category-tag">${escapeHTML(event.category)}</span>
                        <span class="event-symbol">${CATEGORY_SYMBOLS[event.category] || "◇"}</span>
                    </div>
                    <div class="event-card-body">
                        <h3>${escapeHTML(event.title)}</h3>
                        <p class="event-description">${escapeHTML(event.description)}</p>
                        <div class="event-meta">
                            <span>▦ ${escapeHTML(formatDate(event.date))} · ${escapeHTML(event.time)}</span>
                            <span>⌖ ${escapeHTML(event.venue)}</span>
                            <span>♧ ${event.registeredCount} / ${Number(event.capacity)} participants</span>
                        </div>
                        <div class="event-card-actions">
                            ${actionButtons}
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    } catch (error) {
        grid.innerHTML = `<div class="empty-state"><strong>Error loading events:</strong> ${escapeHTML(error.message)}</div>`;
    }
}

$("#eventSearch")?.addEventListener("input", renderEvents);
$("#categoryFilter")?.addEventListener("change", renderEvents);

// --------------------------------------------------
// 8. EVENT CREATION, EDIT & DELETE (ADMIN)
// --------------------------------------------------

$("#createEventBtn")?.addEventListener("click", () => {
    if (currentUser?.role !== "admin") return;

    $("#eventForm").reset();
    $("#editEventId").value = "";
    $("#eventModalTitle").textContent = "Create Event";
    $("#eventFormMessage").textContent = "";
    $("#eventModal").classList.remove("hidden");
});

$("#eventForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentUser?.role !== "admin") {
        showToast("Only administrators can manage events.");
        return;
    }

    const editId = $("#editEventId").value;
    const title = $("#eventTitle").value.trim();
    const category = $("#eventCategory").value;
    const date = $("#eventDate").value;
    const time = $("#eventTime").value;
    const venue = $("#eventVenue").value.trim();
    const capacity = Number($("#eventCapacity").value);
    const description = $("#eventDescription").value.trim();

    if (!title || !date || !time || capacity < 1) {
        $("#eventFormMessage").textContent = "Please fill in all required event details.";
        return;
    }

    const payload = { title, category, date, time, venue, capacity, description };
    const submitBtn = $("#eventForm button[type='submit']");
    submitBtn.disabled = true;

    try {
        if (editId) {
            await apiRequest("/events/" + encodeURIComponent(editId), {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            showToast("Event updated successfully.");
        } else {
            await apiRequest("/events", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            showToast("New event created successfully.");
        }

        $("#eventModal").classList.add("hidden");
        await renderEvents();
        await renderDashboard();
    } catch (error) {
        $("#eventFormMessage").textContent = error.message;
    } finally {
        submitBtn.disabled = false;
    }
});

function editEvent(eventId) {
    if (currentUser?.role !== "admin") return;
    const event = cachedEvents.find(item => item.id === eventId);
    if (!event) return;

    $("#editEventId").value = event.id;
    $("#eventTitle").value = event.title;
    $("#eventCategory").value = event.category;
    $("#eventDate").value = event.date;
    $("#eventTime").value = event.time;
    $("#eventVenue").value = event.venue;
    $("#eventCapacity").value = event.capacity;
    $("#eventDescription").value = event.description;
    $("#eventModalTitle").textContent = "Edit Event";
    $("#eventFormMessage").textContent = "";
    $("#eventModal").classList.remove("hidden");
}

async function deleteEvent(eventId) {
    if (currentUser?.role !== "admin") return;
    const event = cachedEvents.find(item => item.id === eventId);
    if (!event) return;

    const confirmed = confirm(`Are you sure you want to delete "${event.title}" and its related participants, attendance, and feedback?`);
    if (!confirmed) return;

    try {
        await apiRequest("/events/" + encodeURIComponent(eventId), {
            method: "DELETE"
        });
        showToast("Event deleted successfully.");
        await renderEvents();
        await renderDashboard();
    } catch (error) {
        showToast("Delete failed: " + error.message);
    }
}

// --------------------------------------------------
// 8B. CREATE STUDENT ID (ADMIN)
// --------------------------------------------------

$("#createStudentBtn")?.addEventListener("click", () => {
    if (currentUser?.role !== "admin") return;
    $("#studentForm").reset();
    $("#studentFormMessage").textContent = "";
    $("#studentModal").classList.remove("hidden");
});

$("#studentForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentUser?.role !== "admin") return;

    const name = $("#studentName").value.trim();
    const email = $("#studentEmail").value.trim().toLowerCase();
    const enrollmentNumber = $("#studentEnrollment").value.trim().toUpperCase();
    const academicYear = $("#studentAcademicYear").value;
    const department = $("#studentDepartment").value;
    const password = $("#studentInitialPassword").value.trim();

    const submitBtn = $("#studentForm button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Creating Account...";
    $("#studentFormMessage").textContent = "";

    try {
        const payload = {
            name,
            email,
            enrollmentNumber,
            academicYear,
            department
        };
        if (password) {
            payload.password = password;
        }

        const res = await apiRequest("/admin/students", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        $("#studentModal").classList.add("hidden");
        showToast("Student account created: " + res.email);
        alert(
            "Student account created successfully!\n\n" +
            "• Name: " + res.name + "\n" +
            "• Email: " + res.email + "\n" +
            "• Enrollment Number: " + res.enrollmentNumber + "\n" +
            "• Department: " + res.department + " (" + res.academicYear + ")\n" +
            "• Assigned Password: " + res.temporaryPassword + "\n\n" +
            "The student can now log in using these credentials."
        );
    } catch (error) {
        $("#studentFormMessage").textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// --------------------------------------------------
// 9. STUDENT REGISTRATION MODULE
// --------------------------------------------------

async function registerForEvent(eventId) {
    if (currentUser?.role !== "student") return;

    try {
        await apiRequest("/registrations", {
            method: "POST",
            body: JSON.stringify({ eventId })
        });
        showToast("Registration successful!");
        await renderEvents();
        await renderDashboard();
    } catch (error) {
        showToast(error.message);
    }
}

async function cancelRegistration(eventId) {
    if (currentUser?.role !== "student") return;
    if (!confirm("Are you sure you want to cancel this registration?")) return;

    try {
        await apiRequest("/registrations/" + encodeURIComponent(eventId), {
            method: "DELETE"
        });
        showToast("Registration cancelled.");
        await renderEvents();
        if (!$("#registrationsSection").classList.contains("hidden")) {
            await renderRegistrations();
        }
        await renderDashboard();
    } catch (error) {
        showToast("Cancellation error: " + error.message);
    }
}

// Global click delegation for dynamically rendered event cards
document.addEventListener("click", event => {
    const editBtn = event.target.closest("[data-edit-event]");
    const deleteBtn = event.target.closest("[data-delete-event]");
    const registerBtn = event.target.closest("[data-register-event]");
    const cancelBtn = event.target.closest("[data-cancel-registration]");

    if (editBtn) editEvent(editBtn.dataset.editEvent);
    if (deleteBtn) deleteEvent(deleteBtn.dataset.deleteEvent);
    if (registerBtn) registerForEvent(registerBtn.dataset.registerEvent);
    if (cancelBtn) cancelRegistration(cancelBtn.dataset.cancelRegistration);
});

// --------------------------------------------------
// 10. MY REGISTRATIONS MODULE (STUDENT)
// --------------------------------------------------

async function renderRegistrations() {
    const container = $("#registrationsList");
    if (!container || currentUser?.role !== "student") return;

    try {
        const registrations = await apiRequest("/registrations/my");

        if (!registrations.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No registrations yet</strong>
                    Explore upcoming campus events and join one!
                </div>
            `;
            return;
        }

        container.innerHTML = registrations.map(reg => `
            <article class="event-card">
                <div class="event-card-banner">
                    <span class="category-tag">${escapeHTML(reg.eventCategory)}</span>
                    <span class="event-symbol">✓</span>
                </div>
                <div class="event-card-body">
                    <h3>${escapeHTML(reg.eventTitle)}</h3>
                    <div class="event-meta">
                        <span>▦ ${escapeHTML(formatDate(reg.eventDate))}</span>
                        <span>⌖ ${escapeHTML(reg.eventVenue)}</span>
                        <span>Registered: ${escapeHTML(formatDateTime(reg.registrationDate))}</span>
                    </div>
                    <div class="event-card-actions">
                        <button class="secondary-btn" data-cancel-registration="${escapeHTML(reg.eventId)}">
                            Cancel Registration
                        </button>
                    </div>
                </div>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<div class="empty-state">Error: ${escapeHTML(error.message)}</div>`;
    }
}

// --------------------------------------------------
// 11. PARTICIPANTS MODULE (ADMIN)
// --------------------------------------------------

async function renderParticipants() {
    const tbody = $("#participantsTable");
    if (!tbody || currentUser?.role !== "admin") return;

    try {
        const participants = await apiRequest("/participants");

        if (!participants.length) {
            tbody.innerHTML = `<tr><td colspan="4">No participants registered yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = participants.map(reg => `
            <tr>
                <td><strong>${escapeHTML(reg.studentName)}</strong></td>
                <td>${escapeHTML(reg.studentEmail)}</td>
                <td>${escapeHTML(reg.eventTitle)}</td>
                <td>${escapeHTML(formatDateTime(reg.registrationDate))}</td>
            </tr>
        `).join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error loading participants: ${escapeHTML(error.message)}</td></tr>`;
    }
}

// --------------------------------------------------
// 12. ATTENDANCE MODULE (ADMIN)
// --------------------------------------------------

async function renderAttendance() {
    const tbody = $("#attendanceTable");
    if (!tbody || currentUser?.role !== "admin") return;

    try {
        const records = await apiRequest("/attendance");

        if (!records.length) {
            tbody.innerHTML = `<tr><td colspan="4">No registrations available for attendance.</td></tr>`;
            return;
        }

        tbody.innerHTML = records.map(record => {
            const status = record.status || "Pending";
            return `
                <tr>
                    <td><strong>${escapeHTML(record.studentName)}</strong></td>
                    <td>${escapeHTML(record.studentEmail)}</td>
                    <td>${escapeHTML(record.eventTitle)}</td>
                    <td>
                        <select class="small-select" data-attendance-id="${escapeHTML(record.registrationId)}">
                            <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
                            <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error loading attendance: ${escapeHTML(error.message)}</td></tr>`;
    }
}

document.addEventListener("change", async event => {
    const select = event.target.closest("[data-attendance-id]");
    if (!select || currentUser?.role !== "admin") return;

    const registrationId = select.dataset.attendanceId;
    const newStatus = select.value;

    try {
        await apiRequest("/attendance/" + encodeURIComponent(registrationId), {
            method: "PUT",
            body: JSON.stringify({ status: newStatus })
        });
        showToast("Attendance updated to " + newStatus + ".");
    } catch (error) {
        showToast("Failed to update attendance: " + error.message);
    }
});

// --------------------------------------------------
// 13. ANNOUNCEMENTS MODULE
// --------------------------------------------------

$("#createAnnouncementBtn")?.addEventListener("click", () => {
    if (currentUser?.role !== "admin") return;
    $("#announcementForm").reset();
    $("#announcementModal").classList.remove("hidden");
});

$("#announcementForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentUser?.role !== "admin") return;

    const title = $("#announcementTitle").value.trim();
    const message = $("#announcementText").value.trim();

    if (!title || !message) return;

    try {
        await apiRequest("/announcements", {
            method: "POST",
            body: JSON.stringify({ title, message })
        });
        $("#announcementModal").classList.add("hidden");
        showToast("Announcement published successfully.");
        await renderAnnouncements();
    } catch (error) {
        showToast("Failed to publish: " + error.message);
    }
});

async function renderAnnouncements() {
    const container = $("#announcementsList");
    if (!container) return;

    try {
        const announcements = await apiRequest("/announcements");

        if (!announcements.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No announcements yet</strong>
                    New campus updates will appear here.
                </div>
            `;
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <article class="announcement-card">
                <h3>${escapeHTML(ann.title)}</h3>
                <p>${escapeHTML(ann.message)}</p>
                <small>Published ${escapeHTML(formatDateTime(ann.date))}</small>
            </article>
        `).join("");
    } catch (error) {
        container.innerHTML = `<div class="empty-state">Error: ${escapeHTML(error.message)}</div>`;
    }
}

// --------------------------------------------------
// 14. ANALYTICS MODULE (ADMIN)
// --------------------------------------------------

async function renderAnalytics() {
    if (currentUser?.role !== "admin") return;

    try {
        const stats = await apiRequest("/analytics");

        $("#analyticsEvents").textContent = stats.totalEvents;
        $("#analyticsRegistrations").textContent = stats.totalRegistrations;
        $("#analyticsAttendance").textContent = stats.attendanceRate + "%";
        $("#analyticsRating").textContent = stats.averageRating;

        if (typeof Chart !== "undefined") {
            renderPopularityChart(stats.popularity || {});
            renderCategoryChart(stats.categoryCounts || {});
        }
    } catch (error) {
        console.error("Analytics fetch error:", error);
    }
}

function renderPopularityChart(popularityMap) {
    const canvas = $("#popularityChart");
    if (!canvas) return;

    const labels = Object.keys(popularityMap);
    const values = Object.values(popularityMap);

    if (popularityChart) {
        popularityChart.destroy();
    }

    popularityChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Registrations",
                data: values,
                backgroundColor: "#7028E4",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            indexAxis: "y",
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function renderCategoryChart(categoryCountsMap) {
    const canvas = $("#categoryChart");
    if (!canvas) return;

    const labels = Object.keys(categoryCountsMap);
    const values = Object.values(categoryCountsMap);

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#7028E4",
                    "#1937A5",
                    "#A68BFA",
                    "#43A786",
                    "#E6A23C"
                ],
                borderWidth: 2,
                borderColor: "#FFFFFF"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// --------------------------------------------------
// 15. FEEDBACK MODULE (STUDENT)
// --------------------------------------------------

async function renderFeedbackOptions() {
    const select = $("#feedbackEvent");
    if (!select || currentUser?.role !== "student") return;

    try {
        const eligibleEvents = await apiRequest("/feedback/eligible-events");

        if (!eligibleEvents.length) {
            select.innerHTML = `<option value="">No registered events found</option>`;
            return;
        }

        select.innerHTML = `
            <option value="">Select a registered event</option>
            ${eligibleEvents.map(event => `
                <option value="${escapeHTML(event.id)}">${escapeHTML(event.title)}</option>
            `).join("")}
        `;
    } catch (error) {
        select.innerHTML = `<option value="">Error loading registered events</option>`;
    }
}

$("#feedbackForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentUser?.role !== "student") return;

    const eventId = $("#feedbackEvent").value;
    const ratingInput = $("input[name='rating']:checked");
    const comment = $("#feedbackComment").value.trim();

    if (!eventId || !ratingInput || !comment) {
        $("#feedbackMessage").textContent = "Please select an event, choose a star rating, and write your feedback.";
        return;
    }

    const rating = Number(ratingInput.value);
    const submitBtn = $("#feedbackForm button[type='submit']");
    submitBtn.disabled = true;

    try {
        await apiRequest("/feedback", {
            method: "POST",
            body: JSON.stringify({ eventId, rating, comment })
        });

        $("#feedbackForm").reset();
        $("#feedbackMessage").textContent = "";
        showToast("Thank you for your feedback!");
    } catch (error) {
        $("#feedbackMessage").textContent = error.message;
    } finally {
        submitBtn.disabled = false;
    }
});

// --------------------------------------------------
// 16. MODAL CONTROLS & ESCAPE DISMISSAL
// --------------------------------------------------

$$("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        const modal = $("#" + button.dataset.close);
        if (modal) modal.classList.add("hidden");
    });
});

$$(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) modal.classList.add("hidden");
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        $$(".modal").forEach(modal => modal.classList.add("hidden"));
    }
});

// --------------------------------------------------
// 17. SESSION RESTORATION & INITIALIZATION
// --------------------------------------------------

async function checkSavedSession() {
    const savedToken = localStorage.getItem("eventora_jwt_token");
    const savedUserJson = localStorage.getItem("eventora_user");

    if (savedToken && savedUserJson) {
        try {
            currentUser = JSON.parse(savedUserJson);
            openApplication();
        } catch (e) {
            handleLogout();
        }
    }
}

checkSavedSession();
console.log("Eventora full-stack frontend initialized successfully.");