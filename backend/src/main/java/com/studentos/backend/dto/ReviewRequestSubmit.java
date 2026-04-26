package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequestSubmit {
    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code too long")
    private String courseCode;

    @Size(max = 100, message = "Professor name too long")
    private String professor;

    @NotNull(message = "Requester ID is required")
    private Long requesterId;

    private boolean anonymous;
}
