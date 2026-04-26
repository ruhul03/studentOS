package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CampusServiceRequest {
    @NotBlank(message = "Service name is required")
    @Size(max = 100, message = "Name too long")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description too long")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category too long")
    private String category;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location too long")
    private String location;

    @NotBlank(message = "Operating hours are required")
    @Size(max = 100, message = "Operating hours string too long")
    private String operatingHours;

    @Size(max = 100, message = "Contact info too long")
    private String contactInfo;

    @NotBlank(message = "Admin name is required")
    private String adminName;
}
