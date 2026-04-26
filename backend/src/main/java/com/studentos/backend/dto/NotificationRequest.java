package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NotificationRequest {
    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title too long")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message too long")
    private String message;

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    private Long senderId;
    private Long relatedEntityId;
}
