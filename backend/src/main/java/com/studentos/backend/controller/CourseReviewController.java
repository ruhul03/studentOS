package com.studentos.backend.controller;

import com.studentos.backend.model.CourseReview;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.CourseReviewRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class CourseReviewController {

    private final CourseReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public CourseReviewController(CourseReviewRepository reviewRepository, 
                                  UserRepository userRepository,
                                  ActivityService activityService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @GetMapping
    public List<CourseReview> getReviews(@RequestParam(required = false) String courseCode) {
        if (courseCode != null && !courseCode.isEmpty()) {
            return reviewRepository.findByCourseCodeIgnoreCaseOrderByCreatedAtDesc(courseCode);
        }
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<CourseReview> createReview(@RequestBody CourseReviewRequest request) {
        Optional<User> reviewerOpt = userRepository.findById(request.getReviewerId());
        if (reviewerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        CourseReview review = CourseReview.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .professor(request.getProfessor())
                .difficultyRating(request.getDifficultyRating())
                .qualityRating(request.getQualityRating())
                .reviewText(request.getReviewText())
                .reviewer(reviewerOpt.get())
                .helpfulVotes(0)
                .anonymous(request.isAnonymous())
                .build();

        CourseReview savedReview = reviewRepository.save(review);

        // Log Activity
        activityService.logActivity(
            request.getReviewerId(),
            "Course Review Posted",
            "You shared a review for " + savedReview.getCourseCode() + ".",
            "reviews",
            "success"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseReview> updateReview(@PathVariable Long id, @RequestBody CourseReviewRequest request) {
        Optional<CourseReview> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty()) return ResponseEntity.notFound().build();

        CourseReview review = reviewOpt.get();
        if (!review.getReviewer().getId().equals(request.getReviewerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        review.setCourseCode(request.getCourseCode());
        review.setCourseName(request.getCourseName());
        review.setProfessor(request.getProfessor());
        review.setDifficultyRating(request.getDifficultyRating());
        review.setQualityRating(request.getQualityRating());
        review.setReviewText(request.getReviewText());
        review.setAnonymous(request.isAnonymous());

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, @RequestParam Long userId) {
        Optional<CourseReview> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        User user = userOpt.get();
        CourseReview review = reviewOpt.get();

        if (!review.getReviewer().getId().equals(userId) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/helpful")
    public ResponseEntity<CourseReview> markHelpful(@PathVariable Long id) {
        Optional<CourseReview> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isPresent()) {
            CourseReview review = reviewOpt.get();
            review.setHelpfulVotes(review.getHelpfulVotes() + 1);
            return ResponseEntity.ok(reviewRepository.save(review));
        }
        return ResponseEntity.notFound().build();
    }
}

class CourseReviewRequest {
    private String courseCode;
    private String courseName;
    private String professor;
    private int difficultyRating;
    private int qualityRating;
    private String reviewText;
    private Long reviewerId;
    private boolean anonymous;

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getProfessor() { return professor; }
    public void setProfessor(String professor) { this.professor = professor; }
    public int getDifficultyRating() { return difficultyRating; }
    public void setDifficultyRating(int difficultyRating) { this.difficultyRating = difficultyRating; }
    public int getQualityRating() { return qualityRating; }
    public void setQualityRating(int qualityRating) { this.qualityRating = qualityRating; }
    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
}
