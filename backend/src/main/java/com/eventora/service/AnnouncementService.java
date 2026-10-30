package com.eventora.service;

import com.eventora.dto.AnnouncementRequest;
import com.eventora.dto.AnnouncementResponse;
import com.eventora.entity.Announcement;
import com.eventora.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByDateDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String createdBy) {
        String customId = "ANN-" + System.currentTimeMillis();
        Announcement announcement = new Announcement(
                customId,
                request.getTitle().trim(),
                request.getMessage().trim(),
                createdBy
        );
        Announcement saved = announcementRepository.save(announcement);
        return toResponse(saved);
    }

    private AnnouncementResponse toResponse(Announcement ann) {
        return new AnnouncementResponse(
                ann.getCustomId(),
                ann.getTitle(),
                ann.getMessage(),
                ann.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }
}
