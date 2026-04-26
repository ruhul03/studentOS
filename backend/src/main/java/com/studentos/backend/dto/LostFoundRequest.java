package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title too long")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description too long")
    private String description;

    @NotBlank(message = "Type is required")
    private String type; // "Lost" or "Found"

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location too long")
    private String location;

    @NotBlank(message = "Contact info is required")
    @Size(max = 100, message = "Contact info too long")
    private String contactInfo;

    @NotNull(message = "Reporter ID is required")
    private Long reporterId;
}
