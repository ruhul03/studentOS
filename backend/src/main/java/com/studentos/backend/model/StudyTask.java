package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
    
    @Column(nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String type; // Assignment, Exam, Project, Reading

    private LocalDateTime dueDate;

    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
