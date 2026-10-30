package com.eventora.repository;

import com.eventora.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByCustomId(String customId);

    // Concurrency-safe pessimistic write lock for seat reservation
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.customId = :customId")
    Optional<Event> findByCustomIdForUpdate(@Param("customId") String customId);

    List<Event> findAllByOrderByDateAsc();

    boolean existsByCustomId(String customId);
}
