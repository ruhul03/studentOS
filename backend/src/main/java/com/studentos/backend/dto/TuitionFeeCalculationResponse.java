package com.studentos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TuitionFeeCalculationResponse {

    private Long id;
    private Long userId;
    private String programType;
    private Integer creditsTaken;
    private Double perCreditFee;
    private Double tuitionFee;
    private Double baseFee;
    private Double labFee;
    private Double totalFee;
    private Boolean isAfterBatch251;
    private String term;
    private PaymentSchedule paymentSchedule;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSchedule {
        private Double preRegistrationPayment;
        private Double installment1;
        private Double installment2;
        private Double installment3;
        private Double installment4;
        private Double totalInstallments;
        private String paymentType; // "INSTALLMENTS" or "FULL_PAYMENT"
    }
}
