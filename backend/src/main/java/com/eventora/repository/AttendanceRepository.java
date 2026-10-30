package com.eventora.repository;

import com.eventora.entity.Attendance;
import com.eventora.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByCustomId(String customId);

    Optional<Attendance> findByRegistration(Registration registration);

    Optional<Attendance> findByRegistrationCustomId(String registrationCustomId);

    void deleteByRegistration(Registration registration);

    long countByStatus(String status);

    List<Attendance> findAllByOrderByUpdatedAtDesc();
}
