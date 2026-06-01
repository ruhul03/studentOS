package com.studentos.backend.controller;

import com.studentos.backend.dto.CommentRequest;
import com.studentos.backend.dto.CourseReviewRequest;
import com.studentos.backend.model.Comment;
import com.studentos.backend.model.CourseReview;
import com.studentos.backend.service.CourseReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@SuppressWarnings("null")
public class CourseReviewController {

    private final CourseReviewService courseReviewService;

    public CourseReviewController(CourseReviewService courseReviewService) {
        this.courseReviewService = courseReviewService;
    }

    @GetMapping
    public ResponseEntity<List<CourseReview>> getReviews(@RequestParam(required = false) String courseCode) {
        return ResponseEntity.ok(courseReviewService.getReviews(courseCode));
    }

    @PostMapping
    public ResponseEntity<CourseReview> createReview(@Valid @RequestBody CourseReviewRequest request) {
        CourseReview savedReview = courseReviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseReview> updateReview(@PathVariable Long id, @Valid @RequestBody CourseReviewRequest request) {
        CourseReview updatedReview = courseReviewService.updateReview(id, request);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, @RequestParam Long userId) {
        courseReviewService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/helpful")
    public ResponseEntity<CourseReview> markHelpful(@PathVariable Long id) {
        CourseReview updatedReview = courseReviewService.markHelpful(id);
        return ResponseEntity.ok(updatedReview);
    }

    // --- Comment Endpoints ---

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(courseReviewService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        Comment savedComment = courseReviewService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @PostMapping("/{reviewId}/comments/{commentId}/replies")
    public ResponseEntity<Comment> addReply(@PathVariable Long reviewId, @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {
        Comment savedReply = courseReviewService.addReply(reviewId, commentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReply);
    }
}
