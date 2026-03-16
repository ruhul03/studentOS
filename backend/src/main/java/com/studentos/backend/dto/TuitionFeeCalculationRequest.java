package com.studentos.backend.dto;

import com.studentos.backend.model.TuitionFee;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TuitionFeeCalculationRequest {

    @NotNull(message = "Program type is required")
    private TuitionFee.ProgramType programType;

    @NotNull(message = "Credits taken is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer creditsTaken;

    @NotNull(message = "Per credit fee is required")
    @Min(value = 0, message = "Per credit fee must be positive")
    private Double perCreditFee;

    @NotNull(message = "Term is required")
    private String term; // e.g., "Fall 2024", "Trimester 1"

    @NotNull(message = "Batch information is required")
    private Boolean isAfterBatch251;
}
