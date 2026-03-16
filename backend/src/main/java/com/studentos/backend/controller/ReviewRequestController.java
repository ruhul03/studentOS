package com.studentos.backend.controller;

import com.studentos.backend.model.ReviewRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ReviewRequestRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/review-requests")
@CrossOrigin(origins = "*")
public class ReviewRequestController {

    private final ReviewRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ReviewRequestController(ReviewRequestRepository requestRepository, 
                                   UserRepository userRepository,
                                   ActivityService activityService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @GetMapping
    public List<ReviewRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<ReviewRequest> createRequest(@RequestBody ReviewRequestSubmit request) {
        Optional<User> userOpt = userRepository.findById(request.getRequesterId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        ReviewRequest reviewRequest = ReviewRequest.builder()
                .courseCode(request.getCourseCode())
                .professor(request.getProfessor())
                .requester(userOpt.get())
                .anonymous(request.isAnonymous())
                .build();

        ReviewRequest savedRequest = requestRepository.save(reviewRequest);

        activityService.logActivity(
            request.getRequesterId(),
            "Review Requested",
            "You requested a review for " + request.getCourseCode() + ".",
            "reviews",
            "info"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewRequest> updateRequest(@PathVariable Long id, @RequestBody ReviewRequestSubmit request) {
        Optional<ReviewRequest> reqOpt = requestRepository.findById(id);
        if (reqOpt.isEmpty()) return ResponseEntity.notFound().build();

        ReviewRequest reviewRequest = reqOpt.get();
        // Check ownership or admin
        Optional<User> userOpt = userRepository.findById(request.getRequesterId());
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        User user = userOpt.get();

        if (!reviewRequest.getRequester().getId().equals(request.getRequesterId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        reviewRequest.setCourseCode(request.getCourseCode());
        reviewRequest.setProfessor(request.getProfessor());
        reviewRequest.setAnonymous(request.isAnonymous());

        return ResponseEntity.ok(requestRepository.save(reviewRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id, @RequestParam Long userId) {
        Optional<ReviewRequest> reqOpt = requestRepository.findById(id);
        if (reqOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        User user = userOpt.get();
        ReviewRequest req = reqOpt.get();

        if (!req.getRequester().getId().equals(userId) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        requestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

class ReviewRequestSubmit {
    private String courseCode;
    private String professor;
    private Long requesterId;
    private boolean anonymous;

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getProfessor() { return professor; }
    public void setProfessor(String professor) { this.professor = professor; }
    public Long getRequesterId() { return requesterId; }
    public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
}
