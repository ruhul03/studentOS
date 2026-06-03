package com.studentos.backend.service;

import com.studentos.backend.dto.CommentRequest;
import com.studentos.backend.dto.CourseReviewRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.Comment;
import com.studentos.backend.model.CourseReview;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.CommentRepository;
import com.studentos.backend.repository.CourseReviewRepository;
import com.studentos.backend.repository.NotificationRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.repository.ReviewRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@SuppressWarnings("null")
public class CourseReviewService {

    private final CourseReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final ReviewRequestRepository requestRepository;

    public CourseReviewService(CourseReviewRepository reviewRepository,
                               UserRepository userRepository,
                               ActivityService activityService,
                               CommentRepository commentRepository,
                               NotificationService notificationService,
                               NotificationRepository notificationRepository,
                               ReviewRequestRepository requestRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.requestRepository = requestRepository;
    }

    public List<CourseReview> getReviews(String courseCode) {
        if (courseCode != null && !courseCode.isEmpty()) {
            return reviewRepository.findByCourseCodeIgnoreCaseOrderByCreatedAtDesc(courseCode);
        }
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    public CourseReview createReview(CourseReviewRequest request) {
        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getReviewerId()));

        CourseReview review = CourseReview.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .professor(request.getProfessor())
                .difficultyRating(request.getDifficultyRating())
                .qualityRating(request.getQualityRating())
                .reviewText(request.getReviewText())
                .reviewer(reviewer)
                .helpfulVotes(0)
                .anonymous(request.isAnonymous())
                .build();

        CourseReview savedReview = reviewRepository.save(review);

        activityService.logActivity(
                request.getReviewerId(),
                "Course Review Posted",
                "You shared a review for " + savedReview.getCourseCode() + ".",
                "reviews",
                "success");

        if (request.getRequestId() != null) {
            requestRepository.findById(request.getRequestId()).ifPresent(req -> {
                requestRepository.delete(req);
                
                // Notify the requester that their request was fulfilled
                if (!req.getRequester().getId().equals(request.getReviewerId())) {
                    String author = request.isAnonymous() ? "An anonymous student" : reviewer.getName();
                    notificationService.createAndSendNotification(
                        req.getRequester().getId(),
                        "request_fulfilled",
                        "Review Request Fulfilled",
                        author + " posted a review for " + request.getCourseCode(),
                        request.getReviewerId(),
                        savedReview.getId()
                    );
                }
            });
        }

        return savedReview;
    }

    public CourseReview updateReview(Long id, CourseReviewRequest request) {
        CourseReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));

        if (!review.getReviewer().getId().equals(request.getReviewerId())) {
            throw new UnauthorizedActionException("You don't have permission to update this review.");
        }

        review.setCourseCode(request.getCourseCode());
        review.setCourseName(request.getCourseName());
        review.setProfessor(request.getProfessor());
        review.setDifficultyRating(request.getDifficultyRating());
        review.setQualityRating(request.getQualityRating());
        review.setReviewText(request.getReviewText());
        review.setAnonymous(request.isAnonymous());

        return reviewRepository.save(review);
    }

    public void deleteReview(Long id, Long userId) {
        CourseReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!review.getReviewer().getId().equals(userId) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to delete this review.");
        }

        notificationRepository.deleteByRelatedEntityId(id);

        review.getComments().clear();
        reviewRepository.saveAndFlush(review);

        reviewRepository.delete(review);
    }

    public CourseReview markHelpful(Long id) {
        CourseReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));
        review.setHelpfulVotes(review.getHelpfulVotes() + 1);
        return reviewRepository.save(review);
    }

    public List<Comment> getComments(Long id) {
        return commentRepository.findByReviewIdOrderByCreatedAtAsc(id);
    }

    public Comment addComment(Long id, CommentRequest request) {
        CourseReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));

        User commenter = userRepository.findById(request.getCommenterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getCommenterId()));

        Comment comment = Comment.builder()
                .text(request.getText())
                .commenter(commenter)
                .review(review)
                .anonymous(request.isAnonymous())
                .build();

        Comment saved = commentRepository.save(comment);

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

        return saved;
    }

    public Comment addReply(Long reviewId, Long commentId, CommentRequest request) {
        Comment parent = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        User replier = userRepository.findById(request.getCommenterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getCommenterId()));

        Comment reply = Comment.builder()
                .text(request.getText())
                .commenter(replier)
                .review(parent.getReview())
                .anonymous(request.isAnonymous())
                .build();

        parent.getReplies().add(reply);
        commentRepository.save(parent);

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

        return reply;
    }
}
