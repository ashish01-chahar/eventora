package com.eventora.service;

import com.eventora.dto.EventResponse;
import com.eventora.dto.FeedbackRequest;
import com.eventora.dto.FeedbackResponse;
import com.eventora.entity.Event;
import com.eventora.entity.Feedback;
import com.eventora.entity.Registration;
import com.eventora.entity.User;
import com.eventora.exception.BadRequestException;
import com.eventora.exception.ResourceNotFoundException;
import com.eventora.repository.EventRepository;
import com.eventora.repository.FeedbackRepository;
import com.eventora.repository.RegistrationRepository;
import com.eventora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            EventService eventService
    ) {
        this.feedbackRepository = feedbackRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eventService = eventService;
    }

    public List<EventResponse> getEligibleEvents(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));

        List<Registration> registrations = registrationRepository.findByStudentOrderByRegistrationDateDesc(student);
        return registrations.stream()
                .map(reg -> eventService.toResponse(reg.getEvent(), student.getCustomId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));

        Event event = eventRepository.findByCustomId(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + request.getEventId()));

        // Check if student is registered for this event
        if (!registrationRepository.existsByEventAndStudent(event, student)) {
            throw new BadRequestException("You can only submit feedback for events you have registered for.");
        }

        // Check if student already submitted feedback for this event
        if (feedbackRepository.existsByEventAndStudent(event, student)) {
            throw new BadRequestException("You have already submitted feedback for this event.");
        }

        String customId = "FDB-" + System.currentTimeMillis();
        Feedback feedback = new Feedback(
                customId,
                event,
                student,
                request.getRating(),
                request.getComment().trim()
        );
        Feedback saved = feedbackRepository.save(feedback);

        return toResponse(saved);
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FeedbackResponse toResponse(Feedback fb) {
        FeedbackResponse resp = new FeedbackResponse();
        resp.setId(fb.getCustomId());
        resp.setEventId(fb.getEvent().getCustomId());
        resp.setEventTitle(fb.getEvent().getTitle());
        resp.setStudentId(fb.getStudent().getCustomId());
        resp.setStudentName(fb.getStudent().getName());
        resp.setRating(fb.getRating());
        resp.setComment(fb.getComment());
        resp.setSubmittedAt(fb.getSubmittedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return resp;
    }
}
