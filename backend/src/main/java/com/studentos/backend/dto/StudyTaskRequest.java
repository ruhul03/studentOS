package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyTaskRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title too long")
    private String title;

    @Size(max = 500, message = "Description too long")
    private String description;

    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code too long")
    private String courseCode;

    @NotBlank(message = "Task type is required")
    @Size(max = 50, message = "Type name too long")
    private String type;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @NotNull(message = "User ID is required")
    private Long userId;
}
