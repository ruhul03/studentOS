package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Comment text is required")
    @Size(max = 1000, message = "Comment too long")
    private String text;

    @NotNull(message = "Commenter ID is required")
    private Long commenterId;

    private boolean anonymous;
}
