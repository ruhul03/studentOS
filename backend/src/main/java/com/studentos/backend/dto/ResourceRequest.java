package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotBlank(message = "Course title is required")
    private String courseTitle;

    private String fileUrl;

    @NotBlank(message = "Resource type is required")
    private String type;

    @NotNull(message = "Uploader ID is required")
    private Long uploaderId;

    private boolean anonymous;
}
