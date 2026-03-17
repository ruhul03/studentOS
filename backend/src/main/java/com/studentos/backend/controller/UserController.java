package com.studentos.backend.controller;

import com.studentos.backend.dto.ProfileUpdateRequest;
import com.studentos.backend.dto.UserStatsDTO;
import com.studentos.backend.model.Activity;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("UserController Error: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("ERROR: " + e.getClass().getName() + " - " + e.getMessage());
    }

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final StudyTaskRepository studyTaskRepository;
    private final MarketplaceItemRepository marketplaceItemRepository;
    private final ActivityRepository activityRepository;
    private final CampusEventRepository eventRepository;
    private final LostFoundItemRepository lostFoundRepository;
    private final CommentRepository commentRepository;
    private final CourseReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final ReviewRequestRepository reviewRequestRepository;
    private final TuitionFeeRepository tuitionFeeRepository;

    public UserController(UserRepository userRepository, 
                          ResourceRepository resourceRepository,
                          StudyTaskRepository studyTaskRepository,
                          MarketplaceItemRepository marketplaceItemRepository,
                          ActivityRepository activityRepository,
                          CampusEventRepository eventRepository,
                          LostFoundItemRepository lostFoundRepository,
                          CommentRepository commentRepository,
                          CourseReviewRepository reviewRepository,
                          NotificationRepository notificationRepository,
                          MessageRepository messageRepository,
                          ReviewRequestRepository reviewRequestRepository,
                          TuitionFeeRepository tuitionFeeRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.studyTaskRepository = studyTaskRepository;
        this.marketplaceItemRepository = marketplaceItemRepository;
        this.activityRepository = activityRepository;
        this.eventRepository = eventRepository;
        this.lostFoundRepository = lostFoundRepository;
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.messageRepository = messageRepository;
        this.reviewRequestRepository = reviewRequestRepository;
        this.tuitionFeeRepository = tuitionFeeRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateRequest profileUpdate) {
        logger.info("Profile update request received for user ID: {}", id);
        logger.debug("Request body: {}", profileUpdate);

        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        User user = userOptional.get();

        // Enforce 2x update limit logic
        if (user.getUpdateCount() >= 2) {
            if (user.getLastUpdateAt() != null) {
                LocalDateTime lastMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                if (user.getLastUpdateAt().isBefore(lastMonth)) {
                    user.setUpdateCount(0);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can only change your profile info twice a month.");
                }
            }
        }

        // Check username uniqueness if changing
        if (profileUpdate.getUsername() != null && !profileUpdate.getUsername().isEmpty() && !profileUpdate.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(profileUpdate.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken.");
            }
            user.setUsername(profileUpdate.getUsername());
        }

        // Check email validity and uniqueness if changing
        if (profileUpdate.getEmail() != null && !profileUpdate.getEmail().isEmpty() && !profileUpdate.getEmail().equals(user.getEmail())) {
            if (!profileUpdate.getEmail().contains("@") || !profileUpdate.getEmail().contains(".")) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email format.");
            }
            if (userRepository.existsByEmail(profileUpdate.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already in use.");
            }
            user.setEmail(profileUpdate.getEmail());
        }

        if (profileUpdate.getBio() != null) user.setBio(profileUpdate.getBio());
        if (profileUpdate.getProfilePicture() != null) user.setProfilePicture(profileUpdate.getProfilePicture());
        if (profileUpdate.getDepartment() != null) user.setDepartment(profileUpdate.getDepartment());
        if (profileUpdate.getBatch() != null) user.setBatch(profileUpdate.getBatch());
        if (profileUpdate.getStudentId() != null) user.setStudentId(profileUpdate.getStudentId());
        if (profileUpdate.getDateOfBirth() != null) user.setDateOfBirth(profileUpdate.getDateOfBirth());
        if (profileUpdate.getPhoneNumber() != null) user.setPhoneNumber(profileUpdate.getPhoneNumber());

        user.setUpdateCount(user.getUpdateCount() + 1);
        user.setLastUpdateAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // Log Activity
        Activity activity = Activity.builder()
                .userId(id)
                .title("Profile Updated")
                .description("You updated your profile information.")
                .type("profile")
                .status("success")
                .build();
        activityRepository.save(activity);

        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = userOptional.get();

        UserStatsDTO stats = UserStatsDTO.builder()
                .totalCourses(resourceRepository.countUniqueCoursesByUploader(user))
                .pendingTasks(studyTaskRepository.countByUserIdAndCompletedFalse(id))
                .sharedResources(resourceRepository.countByUploader(user))
                .soldItems(marketplaceItemRepository.countBySellerAndSoldTrue(user))
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable Long id, @RequestParam(required = false) Integer limit) {
        if (limit != null) {
            return ResponseEntity.ok(activityRepository.findByUserIdOrderByTimestampDesc(id, PageRequest.of(0, limit)));
        }
        return ResponseEntity.ok(activityRepository.findByUserIdOrderByTimestampDesc(id));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Manual cascade for safety - Purge all user footprints
                    
                    // 1. Handle indirect dependencies for CourseReviews
                    List<com.studentos.backend.model.CourseReview> userReviews = reviewRepository.findAllByReviewer(user);
                    if (!userReviews.isEmpty()) {
                        commentRepository.deleteByReviewIn(userReviews);
                    }
                    
                    // 2. Clear sent notifications (where user is sender)
                    notificationRepository.deleteBySender(user);
                    
                    // 3. Normal cascading deletes
                    resourceRepository.deleteByUploader(user);
                    marketplaceItemRepository.deleteBySeller(user);
                    lostFoundRepository.deleteByReporter(user);
                    eventRepository.deleteByUploaderId(id);
                    activityRepository.deleteByUserId(id);
                    commentRepository.deleteByCommenter(user);
                    reviewRepository.deleteByReviewer(user);
                    notificationRepository.deleteByRecipient(user);
                    messageRepository.deleteBySenderIdOrReceiverId(id, id);
                    studyTaskRepository.deleteByUserId(id);
                    reviewRequestRepository.deleteByRequester(user);
                    tuitionFeeRepository.deleteByUserId(id);
                    
                    userRepository.delete(user);
                    return ResponseEntity.ok("Profile and all associated data deleted successfully.");
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found."));
    }
}
