package com.studentos.backend.service;

import com.studentos.backend.dto.TuitionFeeCalculationRequest;
import com.studentos.backend.dto.TuitionFeeCalculationResponse;
import com.studentos.backend.model.TuitionFee;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.TuitionFeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TuitionFeeService {

    private final TuitionFeeRepository tuitionFeeRepository;

    // Constants for fee structure
    private static final double TRIMESTER_BASE_FEE = 6500.0;
    private static final double SEMESTER_BASE_FEE = 9750.0;
    private static final double BSBGE_LAB_FEE = 2000.0;
    private static final double BPHARM_LAB_FEE = 5000.0;
    private static final double PRE_PAYMENT = 20000.0;

    public TuitionFeeCalculationResponse calculateTuitionFee(TuitionFeeCalculationRequest request, User user) {
        // Check if fee calculation already exists for this user and term
        Optional<TuitionFee> existingFee = tuitionFeeRepository.findByUserAndTerm(user, request.getTerm());
        if (existingFee.isPresent()) {
            throw new IllegalStateException("Fee calculation already exists for term: " + request.getTerm());
        }

        TuitionFee tuitionFee = calculateFeeDetails(request, user);
        TuitionFee savedFee = tuitionFeeRepository.save(tuitionFee);

        return convertToResponse(savedFee);
    }

    public List<TuitionFeeCalculationResponse> getUserFeeHistory(User user) {
        List<TuitionFee> fees = tuitionFeeRepository.findByUserOrderByCreatedAtDesc(user);
        return fees.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public TuitionFeeCalculationResponse getFeeCalculation(Long feeId, User user) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee calculation not found"));

        if (!tuitionFee.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new SecurityException("Access denied");
        }

        return convertToResponse(tuitionFee);
    }

    public TuitionFeeCalculationResponse updateFeeCalculation(Long feeId, TuitionFeeCalculationRequest request, User user) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee calculation not found"));

        if (!tuitionFee.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new SecurityException("Access denied");
        }

        // Update with new calculation
        TuitionFee updatedFee = calculateFeeDetails(request, tuitionFee.getUser());
        updatedFee.setId(feeId);
        updatedFee.setCreatedAt(tuitionFee.getCreatedAt());
        updatedFee.setUpdatedAt(LocalDateTime.now());

        TuitionFee savedFee = tuitionFeeRepository.save(updatedFee);
        return convertToResponse(savedFee);
    }

    public void deleteFeeCalculation(Long feeId, User user) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee calculation not found"));

        if (!tuitionFee.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new SecurityException("Access denied");
        }

        tuitionFeeRepository.delete(tuitionFee);
    }

    private TuitionFee calculateFeeDetails(TuitionFeeCalculationRequest request, User user) {
        double tuitionFeeAmount = request.getCreditsTaken() * request.getPerCreditFee();
        double baseFee = 0.0;
        double labFee = 0.0;

        switch (request.getProgramType()) {
            case TRIMESTER_BSBGE:
                baseFee = TRIMESTER_BASE_FEE;
                labFee = BSBGE_LAB_FEE;
                break;
            case TRIMESTER_OTHER:
                baseFee = TRIMESTER_BASE_FEE;
                labFee = 0.0;
                break;
            case SEMESTER_BPHARM:
                baseFee = SEMESTER_BASE_FEE;
                labFee = BPHARM_LAB_FEE;
                break;
        }

        double totalFee = tuitionFeeAmount + baseFee + labFee;
        double prePayment = request.getIsAfterBatch251() ? PRE_PAYMENT : 0.0;
        double remainingAmount = Math.max(0.0, totalFee - prePayment);

        TuitionFee.TuitionFeeBuilder builder = TuitionFee.builder()
                .user(user)
                .programType(request.getProgramType())
                .creditsTaken(request.getCreditsTaken())
                .perCreditFee(request.getPerCreditFee())
                .tuitionFee(tuitionFeeAmount)
                .baseFee(baseFee)
                .labFee(labFee)
                .totalFee(totalFee)
                .isAfterBatch251(request.getIsAfterBatch251())
                .preRegistrationPayment(prePayment)
                .remainingAmount(remainingAmount)
                .term(request.getTerm());

        // Calculate installments
        if (request.getIsAfterBatch251()) {
            switch (request.getProgramType()) {
                case TRIMESTER_BSBGE:
                case TRIMESTER_OTHER:
                    // 40%, 30%, 30%
                    builder.installment1(remainingAmount * 0.40)
                           .installment2(remainingAmount * 0.30)
                           .installment3(remainingAmount * 0.30)
                           .installment4(0.0);
                    break;
                case SEMESTER_BPHARM:
                    // 25%, 25%, 25%, 25%
                    double installmentAmount = remainingAmount * 0.25;
                    builder.installment1(installmentAmount)
                           .installment2(installmentAmount)
                           .installment3(installmentAmount)
                           .installment4(installmentAmount);
                    break;
            }
        }

        return builder.build();
    }

    private TuitionFeeCalculationResponse convertToResponse(TuitionFee tuitionFee) {
        TuitionFeeCalculationResponse.PaymentSchedule paymentSchedule = new TuitionFeeCalculationResponse.PaymentSchedule();
        paymentSchedule.setPreRegistrationPayment(tuitionFee.getPreRegistrationPayment());
        paymentSchedule.setInstallment1(tuitionFee.getInstallment1());
        paymentSchedule.setInstallment2(tuitionFee.getInstallment2());
        paymentSchedule.setInstallment3(tuitionFee.getInstallment3());
        paymentSchedule.setInstallment4(tuitionFee.getInstallment4());
        paymentSchedule.setTotalInstallments(tuitionFee.getRemainingAmount());
        paymentSchedule.setPaymentType(tuitionFee.getIsAfterBatch251() ? "INSTALLMENTS" : "FULL_PAYMENT");

        TuitionFeeCalculationResponse response = new TuitionFeeCalculationResponse();
        response.setId(tuitionFee.getId());
        response.setUserId(tuitionFee.getUser().getId());
        response.setProgramType(tuitionFee.getProgramType().name());
        response.setCreditsTaken(tuitionFee.getCreditsTaken());
        response.setPerCreditFee(tuitionFee.getPerCreditFee());
        response.setTuitionFee(tuitionFee.getTuitionFee());
        response.setBaseFee(tuitionFee.getBaseFee());
        response.setLabFee(tuitionFee.getLabFee());
        response.setTotalFee(tuitionFee.getTotalFee());
        response.setIsAfterBatch251(tuitionFee.getIsAfterBatch251());
        response.setTerm(tuitionFee.getTerm());
        response.setPaymentSchedule(paymentSchedule);
        response.setCreatedAt(tuitionFee.getCreatedAt());

        return response;
    }
}
