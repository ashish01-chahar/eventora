package com.eventora.repository;

import com.eventora.entity.Event;
import com.eventora.entity.Feedback;
import com.eventora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByCustomId(String customId);

    Optional<Feedback> findByEventAndStudent(Event event, User student);

    boolean existsByEventAndStudent(Event event, User student);

    boolean existsByEventCustomIdAndStudentCustomId(String eventCustomId, String studentCustomId);

    List<Feedback> findByEvent(Event event);

    List<Feedback> findByEventCustomId(String eventCustomId);

    void deleteByEvent(Event event);
}
