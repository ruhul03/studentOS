package com.studentos.backend.controller;

import com.studentos.backend.dto.TuitionFeeCalculationRequest;
import com.studentos.backend.dto.TuitionFeeCalculationResponse;
import com.studentos.backend.model.TuitionFee;
import com.studentos.backend.model.User;
import com.studentos.backend.service.TuitionFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tuition-fees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TuitionFeeController {

    private final TuitionFeeService tuitionFeeService;

    @PostMapping("/calculate")
    public ResponseEntity<TuitionFeeCalculationResponse> calculateTuitionFee(
            @Valid @RequestBody TuitionFeeCalculationRequest request,
            @AuthenticationPrincipal User user) {
        try {
            TuitionFeeCalculationResponse response = tuitionFeeService.calculateTuitionFee(request, user);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<TuitionFeeCalculationResponse>> getUserFeeHistory(
            @AuthenticationPrincipal User user) {
        List<TuitionFeeCalculationResponse> history = tuitionFeeService.getUserFeeHistory(user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{feeId}")
    public ResponseEntity<TuitionFeeCalculationResponse> getFeeCalculation(
            @PathVariable Long feeId,
            @AuthenticationPrincipal User user) {
        try {
            TuitionFeeCalculationResponse response = tuitionFeeService.getFeeCalculation(feeId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PutMapping("/{feeId}")
    public ResponseEntity<TuitionFeeCalculationResponse> updateFeeCalculation(
            @PathVariable Long feeId,
            @Valid @RequestBody TuitionFeeCalculationRequest request,
            @AuthenticationPrincipal User user) {
        try {
            TuitionFeeCalculationResponse response = tuitionFeeService.updateFeeCalculation(feeId, request, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @DeleteMapping("/{feeId}")
    public ResponseEntity<Void> deleteFeeCalculation(
            @PathVariable Long feeId,
            @AuthenticationPrincipal User user) {
        try {
            tuitionFeeService.deleteFeeCalculation(feeId, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }
}
