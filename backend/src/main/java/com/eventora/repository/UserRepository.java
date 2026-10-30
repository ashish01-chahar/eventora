package com.eventora.repository;

import com.eventora.entity.Role;
import com.eventora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCustomId(String customId);
    Optional<User> findByEnrollmentNumber(String enrollmentNumber);
    boolean existsByEmail(String email);
    boolean existsByCustomId(String customId);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
    List<User> findByRole(Role role);
}
