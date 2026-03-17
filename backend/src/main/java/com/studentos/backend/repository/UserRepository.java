package com.studentos.backend.repository;

import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @org.springframework.data.jpa.repository.Query(value = "SELECT department as label, COUNT(*) as value FROM users WHERE department IS NOT NULL GROUP BY department", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> getDepartmentDistribution();

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count FROM users " +
                   "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
                   "GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC", nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> getRegistrationGrowth();
}
