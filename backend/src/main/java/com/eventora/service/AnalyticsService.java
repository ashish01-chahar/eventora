package com.eventora.service;

import com.eventora.dto.AnalyticsResponse;
import com.eventora.entity.Event;
import com.eventora.entity.Feedback;
import com.eventora.repository.AttendanceRepository;
import com.eventora.repository.EventRepository;
import com.eventora.repository.FeedbackRepository;
import com.eventora.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeedbackRepository feedbackRepository;

    public AnalyticsService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            AttendanceRepository attendanceRepository,
            FeedbackRepository feedbackRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse response = new AnalyticsResponse();

        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();
        long presentCount = attendanceRepository.countByStatus("Present");

        int attendanceRate = totalRegistrations > 0
                ? (int) Math.round(((double) presentCount / totalRegistrations) * 100)
                : 0;

        List<Feedback> allFeedback = feedbackRepository.findAll();
        double avgRating = allFeedback.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);

        String formattedAvg = String.format(Locale.US, "%.1f", avgRating);

        // Popularity: Registrations per event
        List<Event> events = eventRepository.findAll();
        Map<String, Long> popularity = new LinkedHashMap<>();
        Map<String, Long> categoryCounts = new LinkedHashMap<>();

        for (Event event : events) {
            long regCount = registrationRepository.countByEvent(event);
            popularity.put(event.getTitle(), regCount);

            categoryCounts.put(event.getCategory(), categoryCounts.getOrDefault(event.getCategory(), 0L) + 1);
        }

        response.setTotalEvents(totalEvents);
        response.setTotalRegistrations(totalRegistrations);
        response.setAttendanceRate(attendanceRate);
        response.setAverageRating(formattedAvg);
        response.setPopularity(popularity);
        response.setCategoryCounts(categoryCounts);

        return response;
    }
}
