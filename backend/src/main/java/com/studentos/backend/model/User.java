package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // STUDENT, ADMIN

    private String bio;

    private String profilePicture;

    private String department;

    private String batch;

    private String studentId;

    private String dateOfBirth;

    @Builder.Default
    @Column(columnDefinition = "integer default 0")
    private int updateCount = 0;

    private LocalDateTime lastUpdateAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
