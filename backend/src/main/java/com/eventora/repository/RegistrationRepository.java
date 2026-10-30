package com.eventora.repository;

import com.eventora.entity.Event;
import com.eventora.entity.Registration;
import com.eventora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByCustomId(String customId);

    Optional<Registration> findByEventAndStudent(Event event, User student);

    Optional<Registration> findByEventCustomIdAndStudentCustomId(String eventCustomId, String studentCustomId);

    List<Registration> findByStudentOrderByRegistrationDateDesc(User student);

    List<Registration> findByStudentCustomIdOrderByRegistrationDateDesc(String studentCustomId);

    List<Registration> findByEvent(Event event);

    List<Registration> findByEventCustomId(String eventCustomId);

    long countByEvent(Event event);

    long countByEventCustomId(String eventCustomId);

    boolean existsByEventAndStudent(Event event, User student);

    boolean existsByEventCustomIdAndStudentCustomId(String eventCustomId, String studentCustomId);

    void deleteByEvent(Event event);

    void deleteByEventCustomIdAndStudentCustomId(String eventCustomId, String studentCustomId);
}
