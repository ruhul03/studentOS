package com.studentos.backend.controller;

import com.studentos.backend.dto.ReviewRequestSubmit;
import com.studentos.backend.model.ReviewRequest;
import com.studentos.backend.service.ReviewRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-requests")
@SuppressWarnings("null")
public class ReviewRequestController {

    private final ReviewRequestService reviewRequestService;

    public ReviewRequestController(ReviewRequestService reviewRequestService) {
        this.reviewRequestService = reviewRequestService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewRequest>> getAllRequests() {
        return ResponseEntity.ok(reviewRequestService.getAllRequests());
    }

    @PostMapping
    public ResponseEntity<ReviewRequest> createRequest(@Valid @RequestBody ReviewRequestSubmit request) {
        ReviewRequest savedRequest = reviewRequestService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewRequest> updateRequest(@PathVariable Long id, @Valid @RequestBody ReviewRequestSubmit request) {
        ReviewRequest updatedRequest = reviewRequestService.updateRequest(id, request);
        return ResponseEntity.ok(updatedRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id, @RequestParam Long userId) {
        reviewRequestService.deleteRequest(id, userId);
        return ResponseEntity.noContent().build();
    }
}
