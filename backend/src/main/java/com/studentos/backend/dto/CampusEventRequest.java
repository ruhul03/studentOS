package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CampusEventRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title too long")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description too long")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location too long")
    private String location;

    @NotBlank(message = "Event date is required")
    private String eventDate;

    @NotBlank(message = "Organizer is required")
    @Size(max = 100, message = "Organizer name too long")
    private String organizer;

    @NotNull(message = "Uploader ID is required")
    private Long uploaderId;
}
