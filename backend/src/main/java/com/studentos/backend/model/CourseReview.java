package com.studentos.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false)
    private String professor;

    @Column(nullable = false)
    private int difficultyRating; // 1 to 5

    @Column(nullable = false)
    private int qualityRating; // 1 to 5

    @Column(length = 1000)
    private String reviewText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Builder.Default
    private int helpfulVotes = 0;

    @Builder.Default
    private boolean anonymous = false;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    @Formula("(SELECT COUNT(*) FROM comments c WHERE c.review_id = id)")
    private int commentCount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
