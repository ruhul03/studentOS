package com.studentos.backend.controller;

import com.studentos.backend.model.Comment;
import com.studentos.backend.model.CourseReview;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.CommentRepository;
import com.studentos.backend.repository.CourseReviewRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import com.studentos.backend.service.NotificationService;
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
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public CourseReviewController(CourseReviewRepository reviewRepository,
            UserRepository userRepository,
            ActivityService activityService,
            CommentRepository commentRepository,
            NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
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
                "success");

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseReview> updateReview(@PathVariable Long id, @RequestBody CourseReviewRequest request) {
        Optional<CourseReview> reviewOpt = reviewRepository.findById(id);
        if (reviewOpt.isEmpty())
            return ResponseEntity.notFound().build();

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
        if (reviewOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

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

    // --- Comment Endpoints ---

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentRepository.findByReviewIdOrderByCreatedAtAsc(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        Optional<CourseReview> reviewOpt = reviewRepository.findById(id);
        Optional<User> commenterOpt = userRepository.findById(request.getCommenterId());

        if (reviewOpt.isEmpty() || commenterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        CourseReview review = reviewOpt.get();
        User commenter = commenterOpt.get();

        Comment comment = Comment.builder()
                .text(request.getText())
                .commenter(commenter)
                .review(review)
                .anonymous(request.isAnonymous())
                .build();

        Comment saved = commentRepository.save(comment);

        // Send Notification to Review Author
        if (!review.getReviewer().getId().equals(commenter.getId())) {
            String senderName = request.isAnonymous() ? "Someone" : commenter.getName();
            notificationService.createAndSendNotification(
                    review.getReviewer().getId(),
                    "comment_posted",
                    "New Comment on Your Review",
                    senderName + " commented on your " + review.getCourseCode() + " review",
                    commenter.getId(),
                    review.getId());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{reviewId}/comments/{commentId}/replies")
    public ResponseEntity<Comment> addReply(@PathVariable Long reviewId, @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        Optional<Comment> parentOpt = commentRepository.findById(commentId);
        Optional<User> replierOpt = userRepository.findById(request.getCommenterId());

        if (parentOpt.isEmpty() || replierOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Comment parent = parentOpt.get();
        User replier = replierOpt.get();

        Comment reply = Comment.builder()
                .text(request.getText())
                .commenter(replier)
                .review(parent.getReview())
                .anonymous(request.isAnonymous())
                .build();

        parent.getReplies().add(reply);
        commentRepository.save(parent);

        // Send Notification to parent comment author
        if (!parent.getCommenter().getId().equals(replier.getId())) {
            String senderName = request.isAnonymous() ? "Someone" : replier.getName();
            notificationService.createAndSendNotification(
                    parent.getCommenter().getId(),
                    "reply_posted",
                    "New Reply to Your Comment",
                    senderName + " replied to your comment on " + parent.getReview().getCourseCode(),
                    replier.getId(),
                    parent.getReview().getId());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
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

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getProfessor() {
        return professor;
    }

    public void setProfessor(String professor) {
        this.professor = professor;
    }

    public int getDifficultyRating() {
        return difficultyRating;
    }

    public void setDifficultyRating(int difficultyRating) {
        this.difficultyRating = difficultyRating;
    }

    public int getQualityRating() {
        return qualityRating;
    }

    public void setQualityRating(int qualityRating) {
        this.qualityRating = qualityRating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }
}

class CommentRequest {
    private String text;
    private Long commenterId;
    private boolean anonymous;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Long getCommenterId() {
        return commenterId;
    }

    public void setCommenterId(Long commenterId) {
        this.commenterId = commenterId;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }
}
