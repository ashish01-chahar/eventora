"use strict";

/*
    EVENTORA
    Frontend demonstration version.

    Demo credentials:
    Admin:   admin@eventora.com / admin123
    Student: student@eventora.com / student123

    This demo uses localStorage.
    Do not use frontend-only credentials in production.
*/


// --------------------------------------------------
// 1. DOM HELPERS
// --------------------------------------------------

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEYS = {
    events: "eventora_events",
    registrations: "eventora_registrations",
    attendance: "eventora_attendance",
    feedback: "eventora_feedback",
    announcements: "eventora_announcements"
};

const DEMO_USERS = [
    {
        id: "admin-1",
        name: "Eventora Admin",
        email: "admin@eventora.com",
        password: "admin123",
        role: "admin"
    },
    {
        id: "student-1",
        name: "Demo Student",
        email: "student@eventora.com",
        password: "student123",
        role: "student"
    }
];

let currentUser = null;

let dashboardChart = null;
let popularityChart = null;
let categoryChart = null;

let toastTimer = null;


// --------------------------------------------------
// 2. STORAGE
// --------------------------------------------------

function readStorage(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return parsed;
    } catch (error) {
        console.error("Storage read error:", error);
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getEvents() {
    return readStorage(STORAGE_KEYS.events, []);
}

function getRegistrations() {
    return readStorage(STORAGE_KEYS.registrations, []);
}

function getAttendance() {
    return readStorage(STORAGE_KEYS.attendance, []);
}

function getFeedback() {
    return readStorage(STORAGE_KEYS.feedback, []);
}

function getAnnouncements() {
    return readStorage(STORAGE_KEYS.announcements, []);
}


// --------------------------------------------------
// 3. INITIAL DEMO DATA
// --------------------------------------------------

function initializeData() {

    if (!localStorage.getItem(STORAGE_KEYS.events)) {

        const demoEvents = [
            {
                id: "EVT-101",
                title: "TechNova Innovation Summit",
                category: "Technical",
                date: futureDate(7),
                time: "10:00",
                venue: "Main Auditorium",
                capacity: 150,
                description:
                    "Explore emerging technologies, innovation and student-led projects.",
                createdBy: "admin-1"
            },
            {
                id: "EVT-102",
                title: "Cultural Fusion Fest",
                category: "Cultural",
                date: futureDate(12),
                time: "14:00",
                venue: "College Ground",
                capacity: 300,
                description:
                    "Celebrate music, dance, creativity and the diversity of campus life.",
                createdBy: "admin-1"
            },
            {
                id: "EVT-103",
                title: "AI & Data Science Workshop",
                category: "Workshop",
                date: futureDate(16),
                time: "11:00",
                venue: "Computer Lab 2",
                capacity: 80,
                description:
                    "Learn practical concepts in AI, data analysis and machine learning.",
                createdBy: "admin-1"
            },
            {
                id: "EVT-104",
                title: "Campus Sports Meet",
                category: "Sports",
                date: futureDate(20),
                time: "09:00",
                venue: "Sports Complex",
                capacity: 200,
                description:
                    "Join your fellow students for a day of games and friendly competition.",
                createdBy: "admin-1"
            },
            {
                id: "EVT-105",
                title: "Web Development Bootcamp",
                category: "Technical",
                date: futureDate(24),
                time: "10:30",
                venue: "Seminar Hall",
                capacity: 100,
                description:
                    "Build your web development foundation through a hands-on session.",
                createdBy: "admin-1"
            },
            {
                id: "EVT-106",
                title: "Creative Minds Workshop",
                category: "Workshop",
                date: futureDate(30),
                time: "12:00",
                venue: "Innovation Centre",
                capacity: 60,
                description:
                    "Develop creative thinking and turn ideas into practical projects.",
                createdBy: "admin-1"
            }
        ];

        writeStorage(STORAGE_KEYS.events, demoEvents);
    }

    if (!localStorage.getItem(STORAGE_KEYS.registrations)) {
        writeStorage(STORAGE_KEYS.registrations, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.attendance)) {
        writeStorage(STORAGE_KEYS.attendance, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.feedback)) {
        writeStorage(STORAGE_KEYS.feedback, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.announcements)) {

        writeStorage(STORAGE_KEYS.announcements, [
            {
                id: "ANN-101",
                title: "Welcome to Eventora",
                message:
                    "Explore campus events, register for activities and share your feedback through Eventora.",
                date: new Date().toISOString()
            },
            {
                id: "ANN-102",
                title: "Stay Updated",
                message:
                    "Check the events section regularly for new workshops, cultural activities and technical events.",
                date: new Date().toISOString()
            }
        ]);
    }
}

function futureDate(days) {
    const date = new Date();

    date.setDate(date.getDate() + days);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


// --------------------------------------------------
// 4. GENERAL HELPERS
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

    if (!dateString) {
        return "Date unavailable";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(dateString) {

    if (!dateString) {
        return "";
    }

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

function getEventById(eventId) {

    return getEvents().find(event => event.id === eventId);
}

function getRegistrationsForEvent(eventId) {

    return getRegistrations().filter(
        registration => registration.eventId === eventId
    );
}

function getRegistrationsForStudent(studentId) {

    return getRegistrations().filter(
        registration => registration.studentId === studentId
    );
}

function showToast(message) {

    const toast = $("#toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


// --------------------------------------------------
// 5. LOGIN
// --------------------------------------------------

$$(".role-btn").forEach(button => {

    button.addEventListener("click", () => {

        $$(".role-btn").forEach(item => {
            item.classList.remove("active");
        });

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


$("#loginForm").addEventListener("submit", event => {

    event.preventDefault();

    const email = $("#email").value.trim().toLowerCase();

    const password = $("#password").value;

    const selectedRole = $("#selectedRole").value;

    $("#loginMessage").textContent = "";

    /*
        DEMO ONLY:
        Replace this client-side credential check with
        a server-side authentication API before deployment.
    */

    const user = DEMO_USERS.find(item =>
        item.email === email &&
        item.password === password &&
        item.role === selectedRole
    );

    if (!user) {

        $("#loginMessage").textContent =
            "Invalid email, password or account type. Please check your details.";

        return;
    }

    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    $("#loginForm").reset();

    $("#selectedRole").value = selectedRole;

    $("#password").type = "password";

    $("#togglePassword").textContent = "Show";

    openApplication();
});


function openApplication() {

    $("#loginPage").classList.add("hidden");

    $("#app").classList.remove("hidden");

    $("#profileName").textContent = currentUser.name;

    $("#profileRole").textContent =
        currentUser.role === "admin"
            ? "Administrator"
            : "Student Account";

    $("#profileAvatar").textContent =
        currentUser.name.charAt(0).toUpperCase();

    const isAdmin = currentUser.role === "admin";

    $$(".admin-only").forEach(element => {
        element.classList.toggle("hidden", !isAdmin);
    });

    $$(".student-only").forEach(element => {
        element.classList.toggle("hidden", isAdmin);
    });

    $("#welcomeHeading").textContent =
        isAdmin
            ? "Welcome back, Admin!"
            : "Welcome to Eventora!";

    $("#welcomeDescription").textContent =
        isAdmin
            ? "Manage events, monitor participation and explore campus insights."
            : "Discover experiences that bring your campus to life.";

    navigateTo("dashboard");

    refreshApplication();
}


// --------------------------------------------------
// 6. LOGOUT
// --------------------------------------------------

$("#logoutBtn").addEventListener("click", () => {

    currentUser = null;

    $("#app").classList.add("hidden");

    $("#loginPage").classList.remove("hidden");

    $("#loginMessage").textContent = "";

    $("#email").value = "";
    $("#password").value = "";

    $("#selectedRole").value = "student";

    $$(".role-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.role === "student"
        );
    });
});


// --------------------------------------------------
// 7. NAVIGATION
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

    if (!currentUser || !PAGE_TITLES[page]) {
        return;
    }

    const adminPages = [
        "participants",
        "attendance",
        "analytics"
    ];

    const studentPages = [
        "registrations",
        "feedback"
    ];

    if (
        currentUser.role !== "admin" &&
        adminPages.includes(page)
    ) {
        showToast("You don't have permission to access this section.");
        return;
    }

    if (
        currentUser.role !== "student" &&
        studentPages.includes(page)
    ) {
        showToast("This section is available to student accounts.");
        return;
    }

    $$(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    $("#" + page + "Section").classList.remove("hidden");

    $$(".nav-link").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    $("#pageHeading").textContent = PAGE_TITLES[page];

    $("#breadcrumbPage").textContent =
        PAGE_TITLES[page].toUpperCase();

    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "events") {
        renderEvents();
    }

    if (page === "registrations") {
        renderRegistrations();
    }

    if (page === "participants") {
        renderParticipants();
    }

    if (page === "attendance") {
        renderAttendance();
    }

    if (page === "announcements") {
        renderAnnouncements();
    }

    if (page === "analytics") {
        renderAnalytics();
    }

    if (page === "feedback") {
        renderFeedbackOptions();
    }
}


$$(".nav-link").forEach(button => {

    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });
});


$$("[data-goto]").forEach(button => {

    button.addEventListener("click", () => {
        navigateTo(button.dataset.goto);
    });
});


// --------------------------------------------------
// 8. DASHBOARD
// --------------------------------------------------

function getStatistics() {

    const events = getEvents();

    const registrations = getRegistrations();

    const attendance = getAttendance();

    const feedback = getFeedback();

    const attendanceCount = attendance.filter(
        record => record.status === "Present"
    ).length;

    const attendanceRate = registrations.length
        ? Math.round(attendanceCount / registrations.length * 100)
        : 0;

    const averageRating = feedback.length
        ? (
            feedback.reduce(
                (total, item) => total + Number(item.rating),
                0
            ) / feedback.length
        ).toFixed(1)
        : "0.0";

    return {
        events,
        registrations,
        attendance,
        feedback,
        attendanceRate,
        averageRating
    };
}


function refreshApplication() {

    renderDashboard();

    renderEvents();

    renderRegistrations();

    renderParticipants();

    renderAttendance();

    renderAnnouncements();

    renderAnalytics();

    renderFeedbackOptions();
}


function renderDashboard() {

    const stats = getStatistics();

    $("#totalEvents").textContent = stats.events.length;

    $("#totalRegistrations").textContent =
        stats.registrations.length;

    $("#attendanceRate").textContent =
        stats.attendanceRate + "%";

    $("#averageRating").textContent =
        stats.averageRating;

    const events = stats.events
        .filter(eventIsUpcoming)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4);

    const dashboardEvents = $("#dashboardEvents");

    if (!events.length) {

        dashboardEvents.innerHTML = `
            <div class="empty-state">
                <strong>No upcoming events</strong>
                Check back later for new campus activities.
            </div>
        `;

    } else {

        dashboardEvents.innerHTML = events.map(event => {

            const date = new Date(event.date + "T00:00:00");

            const day = date.getDate();

            const month = date.toLocaleDateString("en-IN", {
                month: "short"
            });

            return `
                <div class="event-list-item">

                    <div class="event-date-box">
                        <strong>${day}</strong>
                        <span>${escapeHTML(month)}</span>
                    </div>

                    <div class="event-list-info">
                        <strong>${escapeHTML(event.title)}</strong>
                        <p>
                            ${escapeHTML(event.category)}
                            · ${escapeHTML(event.venue)}
                        </p>
                    </div>

                </div>
            `;

        }).join("");
    }

    renderDashboardChart(stats);
}


function renderDashboardChart(stats) {

    const canvas = $("#dashboardChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels = ["Events", "Registrations", "Feedback"];

    const values = [
        stats.events.length,
        stats.registrations.length,
        stats.feedback.length
    ];

    if (dashboardChart) {
        dashboardChart.destroy();
    }

    dashboardChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels,

            datasets: [{
                label: "Total",
                data: values,
                backgroundColor: [
                    "#7028E4",
                    "#1937A5",
                    "#A68BFA"
                ],
                borderRadius: 7,
                maxBarThickness: 45
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


// --------------------------------------------------
// 9. EVENTS
// --------------------------------------------------

const CATEGORY_SYMBOLS = {
    Technical: "⌘",
    Cultural: "♫",
    Sports: "⚽",
    Workshop: "✦",
    Other: "◇"
};


function renderEvents() {

    const grid = $("#eventsGrid");

    if (!grid) {
        return;
    }

    const search = ($("#eventSearch")?.value || "")
        .trim()
        .toLowerCase();

    const category = $("#categoryFilter")?.value || "all";

    const events = getEvents()
        .filter(event => {

            const matchesSearch =
                event.title.toLowerCase().includes(search) ||
                event.description.toLowerCase().includes(search) ||
                event.venue.toLowerCase().includes(search);

            const matchesCategory =
                category === "all" ||
                event.category === category;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    if (!events.length) {

        grid.innerHTML = `
            <div class="empty-state">
                <strong>No events found</strong>
                Try another search or category.
            </div>
        `;

        return;
    }

    const isAdmin = currentUser.role === "admin";

    grid.innerHTML = events.map(event => {

        const registrationCount =
            getRegistrationsForEvent(event.id).length;

        const alreadyRegistered = getRegistrationsForEvent(
            event.id
        ).some(registration =>
            registration.studentId === currentUser.id
        );

        const full = registrationCount >= Number(event.capacity);

        let primaryButton = "";

        if (isAdmin) {

            primaryButton = `
                <button
                    class="secondary-btn"
                    data-edit-event="${escapeHTML(event.id)}">
                    Edit
                </button>

                <button
                    class="danger-btn"
                    data-delete-event="${escapeHTML(event.id)}">
                    Delete
                </button>
            `;

        } else {

            primaryButton = alreadyRegistered
                ? `
                    <button
                        class="secondary-btn"
                        data-cancel-registration="${escapeHTML(event.id)}">
                        Cancel Registration
                    </button>
                `
                : `
                    <button
                        class="primary-btn"
                        data-register-event="${escapeHTML(event.id)}"
                        ${full || !eventIsUpcoming(event) ? "disabled" : ""}>
                        ${
                            !eventIsUpcoming(event)
                                ? "Event Ended"
                                : full
                                    ? "Event Full"
                                    : "Register Now →"
                        }
                    </button>
                `;
        }

        return `
            <article class="event-card">

                <div class="event-card-banner">

                    <span class="category-tag">
                        ${escapeHTML(event.category)}
                    </span>

                    <span class="event-symbol">
                        ${CATEGORY_SYMBOLS[event.category] || "◇"}
                    </span>

                </div>

                <div class="event-card-body">

                    <h3>${escapeHTML(event.title)}</h3>

                    <p class="event-description">
                        ${escapeHTML(event.description)}
                    </p>

                    <div class="event-meta">

                        <span>▦ ${escapeHTML(formatDate(event.date))} · ${escapeHTML(event.time)}</span>

                        <span>⌖ ${escapeHTML(event.venue)}</span>

                        <span>
                            ♧ ${registrationCount} / ${Number(event.capacity)} participants
                        </span>

                    </div>

                    <div class="event-card-actions">
                        ${primaryButton}
                    </div>

                </div>

            </article>
        `;

    }).join("");
}


$("#eventSearch").addEventListener("input", renderEvents);

$("#categoryFilter").addEventListener("change", renderEvents);


// --------------------------------------------------
// 10. CREATE / EDIT / DELETE EVENTS
// --------------------------------------------------

$("#createEventBtn").addEventListener("click", () => {

    if (currentUser?.role !== "admin") {
        return;
    }

    $("#eventForm").reset();

    $("#editEventId").value = "";

    $("#eventModalTitle").textContent = "Create Event";

    $("#eventFormMessage").textContent = "";

    $("#eventModal").classList.remove("hidden");
});


$("#eventForm").addEventListener("submit", event => {

    event.preventDefault();

    if (currentUser?.role !== "admin") {
        showToast("Only administrators can manage events.");
        return;
    }

    const id = $("#editEventId").value;

    const title = $("#eventTitle").value.trim();

    const date = $("#eventDate").value;

    const time = $("#eventTime").value;

    const capacity = Number($("#eventCapacity").value);

    if (!title || !date || !time || capacity < 1) {

        $("#eventFormMessage").textContent =
            "Please enter valid event details.";

        return;
    }

    if (id) {

        const events = getEvents();

        const index = events.findIndex(item => item.id === id);

        if (index === -1) {
            showToast("Event not found.");
            return;
        }

        events[index] = {
            ...events[index],
            title,
            date,
            time,
            category: $("#eventCategory").value,
            venue: $("#eventVenue").value.trim(),
            capacity,
            description: $("#eventDescription").value.trim()
        };

        writeStorage(STORAGE_KEYS.events, events);

        showToast("Event updated successfully.");

    } else {

        const eventData = {
            id: "EVT-" + Date.now(),
            title,
            date,
            time,
            category: $("#eventCategory").value,
            venue: $("#eventVenue").value.trim(),
            capacity,
            description: $("#eventDescription").value.trim(),
            createdBy: currentUser.id
        };

        const events = getEvents();

        events.push(eventData);

        writeStorage(STORAGE_KEYS.events, events);

        showToast("New event created successfully.");
    }

    $("#eventModal").classList.add("hidden");

    refreshApplication();

    navigateTo("events");
});


document.addEventListener("click", event => {

    const editButton = event.target.closest("[data-edit-event]");

    const deleteButton = event.target.closest("[data-delete-event]");

    const registerButton = event.target.closest("[data-register-event]");

    const cancelButton = event.target.closest("[data-cancel-registration]");

    if (editButton) {
        editEvent(editButton.dataset.editEvent);
    }

    if (deleteButton) {
        deleteEvent(deleteButton.dataset.deleteEvent);
    }

    if (registerButton) {
        registerForEvent(registerButton.dataset.registerEvent);
    }

    if (cancelButton) {
        cancelRegistration(cancelButton.dataset.cancelRegistration);
    }
});


function editEvent(eventId) {

    if (currentUser?.role !== "admin") {
        return;
    }

    const event = getEventById(eventId);

    if (!event) {
        return;
    }

    $("#editEventId").value = event.id;

    $("#eventTitle").value = event.title;

    $("#eventCategory").value = event.category;

    $("#eventDate").value = event.date;

    $("#eventTime").value = event.time;

    $("#eventVenue").value = event.venue;

    $("#eventCapacity").value = event.capacity;

    $("#eventDescription").value = event.description;

    $("#eventModalTitle").textContent = "Edit Event";

    $("#eventModal").classList.remove("hidden");
}


function deleteEvent(eventId) {

    if (currentUser?.role !== "admin") {
        return;
    }

    const event = getEventById(eventId);

    if (!event) {
        return;
    }

    const confirmed = confirm(
        `Delete "${event.title}" and its related registrations, attendance and feedback?`
    );

    if (!confirmed) {
        return;
    }

    writeStorage(
        STORAGE_KEYS.events,
        getEvents().filter(item => item.id !== eventId)
    );

    writeStorage(
        STORAGE_KEYS.registrations,
        getRegistrations().filter(item => item.eventId !== eventId)
    );

    writeStorage(
        STORAGE_KEYS.attendance,
        getAttendance().filter(item => item.eventId !== eventId)
    );

    writeStorage(
        STORAGE_KEYS.feedback,
        getFeedback().filter(item => item.eventId !== eventId)
    );

    showToast("Event deleted.");

    refreshApplication();
}


// --------------------------------------------------
// 11. STUDENT REGISTRATION
// --------------------------------------------------

function registerForEvent(eventId) {

    if (currentUser?.role !== "student") {
        return;
    }

    const event = getEventById(eventId);

    if (!event) {
        showToast("Event not found.");
        return;
    }

    if (!eventIsUpcoming(event)) {
        showToast("Registration is closed for this event.");
        return;
    }

    const registrations = getRegistrations();

    const alreadyRegistered = registrations.some(item =>
        item.eventId === eventId &&
        item.studentId === currentUser.id
    );

    if (alreadyRegistered) {
        showToast("You are already registered.");
        return;
    }

    const eventRegistrations = registrations.filter(
        item => item.eventId === eventId
    );

    if (eventRegistrations.length >= Number(event.capacity)) {
        showToast("Sorry, this event is full.");
        return;
    }

    registrations.push({
        id: "REG-" + Date.now(),
        eventId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        registrationDate: new Date().toISOString()
    });

    writeStorage(STORAGE_KEYS.registrations, registrations);

    showToast("Registration successful!");

    refreshApplication();
}


function cancelRegistration(eventId) {

    if (currentUser?.role !== "student") {
        return;
    }

    const registration = getRegistrations().find(item =>
        item.eventId === eventId &&
        item.studentId === currentUser.id
    );

    if (!registration) {
        return;
    }

    if (!confirm("Are you sure you want to cancel this registration?")) {
        return;
    }

    writeStorage(
        STORAGE_KEYS.registrations,
        getRegistrations().filter(
            item => item.id !== registration.id
        )
    );

    writeStorage(
        STORAGE_KEYS.attendance,
        getAttendance().filter(
            item => item.registrationId !== registration.id
        )
    );

    showToast("Registration cancelled.");

    refreshApplication();
}


// --------------------------------------------------
// 12. MY REGISTRATIONS
// --------------------------------------------------

function renderRegistrations() {

    const container = $("#registrationsList");

    if (!container || !currentUser) {
        return;
    }

    if (currentUser.role !== "student") {
        container.innerHTML = "";
        return;
    }

    const registrations = getRegistrationsForStudent(currentUser.id);

    if (!registrations.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No registrations yet</strong>
                Explore upcoming events and register for one.
            </div>
        `;

        return;
    }

    container.innerHTML = registrations.map(registration => {

        const event = getEventById(registration.eventId);

        if (!event) {
            return "";
        }

        return `
            <article class="event-card">

                <div class="event-card-banner">
                    <span class="category-tag">
                        ${escapeHTML(event.category)}
                    </span>

                    <span class="event-symbol">✓</span>
                </div>

                <div class="event-card-body">

                    <h3>${escapeHTML(event.title)}</h3>

                    <p class="event-description">
                        ${escapeHTML(event.description)}
                    </p>

                    <div class="event-meta">

                        <span>▦ ${escapeHTML(formatDate(event.date))}</span>

                        <span>⌖ ${escapeHTML(event.venue)}</span>

                        <span>
                            Registered: ${escapeHTML(formatDateTime(registration.registrationDate))}
                        </span>

                    </div>

                    <div class="event-card-actions">

                        <button
                            class="secondary-btn"
                            data-cancel-registration="${escapeHTML(event.id)}">
                            Cancel Registration
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


// --------------------------------------------------
// 13. PARTICIPANTS
// --------------------------------------------------

function renderParticipants() {

    const tbody = $("#participantsTable");

    if (!tbody) {
        return;
    }

    if (currentUser?.role !== "admin") {
        tbody.innerHTML = "";
        return;
    }

    const registrations = getRegistrations();

    if (!registrations.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">No participants registered yet.</td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = registrations.map(registration => {

        const event = getEventById(registration.eventId);

        if (!event) {
            return "";
        }

        return `
            <tr>

                <td>
                    <strong>${escapeHTML(registration.studentName)}</strong>
                </td>

                <td>${escapeHTML(registration.studentEmail)}</td>

                <td>${escapeHTML(event.title)}</td>

                <td>${escapeHTML(formatDateTime(registration.registrationDate))}</td>

            </tr>
        `;

    }).join("");
}


// --------------------------------------------------
// 14. ATTENDANCE
// --------------------------------------------------

function renderAttendance() {

    const tbody = $("#attendanceTable");

    if (!tbody) {
        return;
    }

    if (currentUser?.role !== "admin") {
        tbody.innerHTML = "";
        return;
    }

    const registrations = getRegistrations();

    if (!registrations.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">No registrations available for attendance.</td>
            </tr>
        `;

        return;
    }

    const attendance = getAttendance();

    tbody.innerHTML = registrations.map(registration => {

        const event = getEventById(registration.eventId);

        if (!event) {
            return "";
        }

        const record = attendance.find(item =>
            item.registrationId === registration.id
        );

        const status = record?.status || "Pending";

        return `
            <tr>

                <td>
                    <strong>${escapeHTML(registration.studentName)}</strong>
                </td>

                <td>${escapeHTML(registration.studentEmail)}</td>

                <td>${escapeHTML(event.title)}</td>

                <td>

                    <select
                        class="small-select"
                        data-attendance-id="${escapeHTML(registration.id)}">

                        <option value="Pending"
                            ${status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="Present"
                            ${status === "Present" ? "selected" : ""}>
                            Present
                        </option>

                        <option value="Absent"
                            ${status === "Absent" ? "selected" : ""}>
                            Absent
                        </option>

                    </select>

                </td>

            </tr>
        `;

    }).join("");
}


document.addEventListener("change", event => {

    const select = event.target.closest("[data-attendance-id]");

    if (!select) {
        return;
    }

    if (currentUser?.role !== "admin") {
        return;
    }

    const registrationId = select.dataset.attendanceId;

    const registration = getRegistrations().find(
        item => item.id === registrationId
    );

    if (!registration) {
        return;
    }

    const attendance = getAttendance();

    const existingIndex = attendance.findIndex(
        item => item.registrationId === registrationId
    );

    const record = {
        id: existingIndex >= 0
            ? attendance[existingIndex].id
            : "ATT-" + Date.now(),

        registrationId,

        eventId: registration.eventId,

        studentId: registration.studentId,

        status: select.value,

        updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        attendance[existingIndex] = record;
    } else {
        attendance.push(record);
    }

    writeStorage(STORAGE_KEYS.attendance, attendance);

    showToast("Attendance updated.");

    renderDashboard();
    renderAnalytics();
});


// --------------------------------------------------
// 15. ANNOUNCEMENTS
// --------------------------------------------------

$("#createAnnouncementBtn").addEventListener("click", () => {

    if (currentUser?.role !== "admin") {
        return;
    }

    $("#announcementForm").reset();

    $("#announcementModal").classList.remove("hidden");
});


$("#announcementForm").addEventListener("submit", event => {

    event.preventDefault();

    if (currentUser?.role !== "admin") {
        return;
    }

    const announcement = {
        id: "ANN-" + Date.now(),

        title: $("#announcementTitle").value.trim(),

        message: $("#announcementText").value.trim(),

        date: new Date().toISOString()
    };

    const announcements = getAnnouncements();

    announcements.unshift(announcement);

    writeStorage(STORAGE_KEYS.announcements, announcements);

    $("#announcementModal").classList.add("hidden");

    showToast("Announcement published.");

    renderAnnouncements();
});


function renderAnnouncements() {

    const container = $("#announcementsList");

    if (!container) {
        return;
    }

    const announcements = getAnnouncements();

    if (!announcements.length) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>No announcements yet</strong>
                New campus updates will appear here.
            </div>
        `;

        return;
    }

    container.innerHTML = announcements.map(item => `

        <article class="announcement-card">

            <h3>${escapeHTML(item.title)}</h3>

            <p>${escapeHTML(item.message)}</p>

            <small>
                Published ${escapeHTML(formatDateTime(item.date))}
            </small>

        </article>

    `).join("");
}


// --------------------------------------------------
// 16. ANALYTICS
// --------------------------------------------------

function renderAnalytics() {

    if (currentUser?.role !== "admin") {
        return;
    }

    const stats = getStatistics();

    $("#analyticsEvents").textContent = stats.events.length;

    $("#analyticsRegistrations").textContent =
        stats.registrations.length;

    $("#analyticsAttendance").textContent =
        stats.attendanceRate + "%";

    $("#analyticsRating").textContent =
        stats.averageRating;

    if (typeof Chart === "undefined") {
        return;
    }

    renderPopularityChart(stats.events);

    renderCategoryChart(stats.events);
}


function renderPopularityChart(events) {

    const canvas = $("#popularityChart");

    if (!canvas) {
        return;
    }

    const labels = events.map(event => event.title);

    const values = events.map(event =>
        getRegistrationsForEvent(event.id).length
    );

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

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


function renderCategoryChart(events) {

    const canvas = $("#categoryChart");

    if (!canvas) {
        return;
    }

    const categoryCounts = {};

    events.forEach(event => {

        categoryCounts[event.category] =
            (categoryCounts[event.category] || 0) + 1;
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(canvas, {

        type: "doughnut",

        data: {
            labels: Object.keys(categoryCounts),

            datasets: [{
                data: Object.values(categoryCounts),

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
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// --------------------------------------------------
// 17. FEEDBACK
// --------------------------------------------------

function renderFeedbackOptions() {

    const select = $("#feedbackEvent");

    if (!select) {
        return;
    }

    if (currentUser?.role !== "student") {
        select.innerHTML = "";
        return;
    }

    const registeredEventIds = new Set(
        getRegistrationsForStudent(currentUser.id)
            .map(item => item.eventId)
    );

    const eligibleEvents = getEvents().filter(event =>
        registeredEventIds.has(event.id)
    );

    select.innerHTML = `
        <option value="">Select a registered event</option>

        ${eligibleEvents.map(event => `

            <option value="${escapeHTML(event.id)}">
                ${escapeHTML(event.title)}
            </option>

        `).join("")}
    `;
}


$("#feedbackForm").addEventListener("submit", event => {

    event.preventDefault();

    if (currentUser?.role !== "student") {
        return;
    }

    const eventId = $("#feedbackEvent").value;

    const rating = $("input[name='rating']:checked")?.value;

    const comment = $("#feedbackComment").value.trim();

    if (!eventId || !rating || !comment) {

        $("#feedbackMessage").textContent =
            "Please select an event, choose a rating and enter feedback.";

        return;
    }

    const alreadySubmitted = getFeedback().some(item =>
        item.eventId === eventId &&
        item.studentId === currentUser.id
    );

    if (alreadySubmitted) {

        $("#feedbackMessage").textContent =
            "You have already submitted feedback for this event.";

        return;
    }

    const feedback = getFeedback();

    feedback.push({
        id: "FDB-" + Date.now(),

        eventId,

        studentId: currentUser.id,

        studentName: currentUser.name,

        rating: Number(rating),

        comment,

        submittedAt: new Date().toISOString()
    });

    writeStorage(STORAGE_KEYS.feedback, feedback);

    $("#feedbackForm").reset();

    $("#feedbackMessage").textContent = "";

    showToast("Thank you for your feedback!");

    renderDashboard();
    renderAnalytics();
});


// --------------------------------------------------
// 18. MODAL CONTROLS
// --------------------------------------------------

$$("[data-close]").forEach(button => {

    button.addEventListener("click", () => {

        const modal = $("#" + button.dataset.close);

        if (modal) {
            modal.classList.add("hidden");
        }
    });
});


$$(".modal").forEach(modal => {

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        $$(".modal").forEach(modal => {
            modal.classList.add("hidden");
        });
    }
});


// --------------------------------------------------
// 19. START APPLICATION
// --------------------------------------------------

initializeData();

console.log("Eventora frontend initialized successfully.");