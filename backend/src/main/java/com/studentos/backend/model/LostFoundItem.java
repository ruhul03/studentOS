package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lost_found_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String type; // "Lost" or "Found"

    @Column(nullable = false)
    private String location; // Where it was lost/found

    @Column(nullable = false)
    private String contactInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Builder.Default
    private boolean resolved = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime reportedAt;
}
