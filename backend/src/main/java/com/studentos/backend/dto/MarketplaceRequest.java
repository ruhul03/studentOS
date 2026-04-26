package com.studentos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotBlank(message = "Condition is required")
    private String condition;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Contact info is required")
    private String contactInfo;

    private String photosJson;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;
}
