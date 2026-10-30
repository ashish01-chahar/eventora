package com.eventora.repository;

import com.eventora.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    Optional<Announcement> findByCustomId(String customId);

    List<Announcement> findAllByOrderByDateDesc();
}
