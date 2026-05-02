package com.studentos.backend.service;

import com.studentos.backend.dto.ProfileUpdateRequest;
import com.studentos.backend.dto.UserStatsDTO;
import com.studentos.backend.model.Activity;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@SuppressWarnings("null")
public class UserService {

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

    public UserService(UserRepository userRepository,
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

    public Optional<User> getUserProfile(Long id) {
        return userRepository.findById(id);
    }

    public ResponseEntity<?> updateProfile(Long id, ProfileUpdateRequest profileUpdate, User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(id) && !"ADMIN".equals(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile.");
        }

        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        User user = userOptional.get();

        if (!"ADMIN".equals(currentUser.getRole()) && user.getUpdateCount() >= 2) {
            if (user.getLastUpdateAt() != null) {
                LocalDateTime lastMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                if (user.getLastUpdateAt().isBefore(lastMonth)) {
                    user.setUpdateCount(0);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You can only change your profile info twice a month.");
                }
            }
        }

        if (profileUpdate.getUsername() != null && !profileUpdate.getUsername().isEmpty() && !profileUpdate.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(profileUpdate.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken.");
            }
            user.setUsername(profileUpdate.getUsername());
        }

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

    public ResponseEntity<?> getDashboardStats(Long id) {
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
                .completedTasks(studyTaskRepository.countByUserIdAndCompletedTrue(id))
                .build();

        return ResponseEntity.ok(stats);
    }

    public List<Activity> getActivities(Long id, Integer limit) {
        if (limit != null) {
            return activityRepository.findByUserIdOrderByTimestampDesc(id, PageRequest.of(0, limit));
        }
        return activityRepository.findByUserIdOrderByTimestampDesc(id);
    }

    public ResponseEntity<?> deleteProfile(Long id, User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(id) && !"ADMIN".equals(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own profile.");
        }

        return userRepository.findById(id)
                .map(user -> {
                    List<com.studentos.backend.model.CourseReview> userReviews = reviewRepository.findAllByReviewer(user);
                    userReviews.forEach(review -> {
                        notificationRepository.deleteByRelatedEntityId(review.getId());
                        reviewRepository.delete(review);
                    });

                    notificationRepository.deleteBySender(user);
                    resourceRepository.deleteByUploader(user);
                    marketplaceItemRepository.deleteBySeller(user);
                    lostFoundRepository.deleteByReporter(user);
                    eventRepository.deleteByUploaderId(id);
                    activityRepository.deleteByUserId(id);
                    commentRepository.deleteByCommenter(user);
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
