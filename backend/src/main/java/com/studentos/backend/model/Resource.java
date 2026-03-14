package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String fileUrl; // URL or File path where the uploaded resource is saved

    @Column(nullable = false)
    private String type; // "Notes", "Exam Paper", "Study Guide", etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Builder.Default
    private int upvotes = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
}
