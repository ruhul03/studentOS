package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tuition_fees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TuitionFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramType programType;

    @Column(nullable = false)
    private Integer creditsTaken;

    @Column(nullable = false)
    private Double perCreditFee;

    @Column(nullable = false)
    private Double tuitionFee;

    @Column(nullable = false)
    private Double baseFee; // Trimester or Semester fee

    @Column(nullable = false)
    private Double labFee;

    @Column(nullable = false)
    private Double totalFee;

    @Column(nullable = false)
    private Boolean isAfterBatch251;

    @Column(nullable = false)
    private Double preRegistrationPayment;

    @Column(nullable = false)
    private Double remainingAmount;

    // Installment amounts
    private Double installment1;
    private Double installment2;
    private Double installment3;
    private Double installment4;

    @Column(nullable = false)
    private String term; // e.g., "Fall 2024", "Trimester 1"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    public enum ProgramType {
        TRIMESTER_BSBGE,
        TRIMESTER_OTHER,
        SEMESTER_BPHARM
    }
}
