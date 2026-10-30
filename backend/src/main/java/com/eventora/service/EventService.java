package com.eventora.service;

import com.eventora.dto.EventRequest;
import com.eventora.dto.EventResponse;
import com.eventora.entity.Event;
import com.eventora.exception.ResourceNotFoundException;
import com.eventora.repository.AttendanceRepository;
import com.eventora.repository.EventRepository;
import com.eventora.repository.FeedbackRepository;
import com.eventora.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeedbackRepository feedbackRepository;

    public EventService(
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

    public List<EventResponse> getAllEvents(String studentCustomId) {
        List<Event> events = eventRepository.findAllByOrderByDateAsc();
        return events.stream()
                .map(event -> toResponse(event, studentCustomId))
                .collect(Collectors.toList());
    }

    public EventResponse getEvent(String customId, String studentCustomId) {
        Event event = eventRepository.findByCustomId(customId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + customId));
        return toResponse(event, studentCustomId);
    }

    @Transactional
    public EventResponse createEvent(EventRequest request, String createdBy) {
        String customId = "EVT-" + System.currentTimeMillis();
        Event event = new Event(
                customId,
                request.getTitle().trim(),
                request.getCategory(),
                LocalDate.parse(request.getDate().trim()),
                request.getTime().trim(),
                request.getVenue().trim(),
                request.getCapacity(),
                request.getDescription().trim(),
                createdBy
        );
        Event saved = eventRepository.save(event);
        return toResponse(saved, null);
    }

    @Transactional
    public EventResponse updateEvent(String customId, EventRequest request) {
        Event event = eventRepository.findByCustomId(customId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + customId));

        event.setTitle(request.getTitle().trim());
        event.setCategory(request.getCategory());
        event.setDate(LocalDate.parse(request.getDate().trim()));
        event.setTime(request.getTime().trim());
        event.setVenue(request.getVenue().trim());
        event.setCapacity(request.getCapacity());
        event.setDescription(request.getDescription().trim());

        Event updated = eventRepository.save(event);
        return toResponse(updated, null);
    }

    @Transactional
    public void deleteEvent(String customId) {
        Event event = eventRepository.findByCustomId(customId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + customId));

        // Cascade cleanup: delete attendance for all registrations of this event
        registrationRepository.findByEvent(event).forEach(attendanceRepository::deleteByRegistration);
        // Delete all registrations for this event
        registrationRepository.deleteByEvent(event);
        // Delete all feedback for this event
        feedbackRepository.deleteByEvent(event);
        // Delete the event itself
        eventRepository.delete(event);
    }

    public EventResponse toResponse(Event event, String studentCustomId) {
        EventResponse resp = new EventResponse();
        resp.setId(event.getCustomId());
        resp.setTitle(event.getTitle());
        resp.setCategory(event.getCategory());
        resp.setDate(event.getDate().toString());
        resp.setTime(event.getTime());
        resp.setVenue(event.getVenue());
        resp.setCapacity(event.getCapacity());
        resp.setDescription(event.getDescription());
        resp.setCreatedBy(event.getCreatedBy());

        long count = registrationRepository.countByEvent(event);
        resp.setRegisteredCount(count);

        if (studentCustomId != null && !studentCustomId.isBlank()) {
            boolean registered = registrationRepository.existsByEventCustomIdAndStudentCustomId(
                    event.getCustomId(), studentCustomId
            );
            resp.setAlreadyRegistered(registered);
        } else {
            resp.setAlreadyRegistered(false);
        }

        return resp;
    }
}
