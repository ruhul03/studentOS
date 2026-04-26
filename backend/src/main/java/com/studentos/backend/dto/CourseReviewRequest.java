package com.studentos.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CourseReviewRequest {
    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code too long")
    private String courseCode;

    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name too long")
    private String courseName;

    @NotBlank(message = "Professor name is required")
    @Size(max = 100, message = "Professor name too long")
    private String professor;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int difficultyRating;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int qualityRating;

    @NotBlank(message = "Review text is required")
    @Size(max = 2000, message = "Review text too long")
    private String reviewText;

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;

    private boolean anonymous;
}
