package com.studentos.backend.service;

import com.studentos.backend.dto.ProfileUpdateRequest;
import com.studentos.backend.dto.UserStatsDTO;
import com.studentos.backend.model.Activity;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
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

    public User updateProfile(Long id, ProfileUpdateRequest profileUpdate, User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(id) && !"ADMIN".equals(currentUser.getRole()))) {
            throw new UnauthorizedActionException("You can only update your own profile.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!"ADMIN".equals(currentUser.getRole()) && user.getUpdateCount() >= 2) {
            if (user.getLastUpdateAt() != null) {
                LocalDateTime lastMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                if (user.getLastUpdateAt().isBefore(lastMonth)) {
                    user.setUpdateCount(0);
                } else {
                    throw new IllegalArgumentException("You can only change your profile info twice a month.");
                }
            }
        }

        if (profileUpdate.getUsername() != null && !profileUpdate.getUsername().isEmpty() && !profileUpdate.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(profileUpdate.getUsername())) {
                throw new IllegalArgumentException("Username is already taken.");
            }
            user.setUsername(profileUpdate.getUsername());
        }

        if (profileUpdate.getEmail() != null && !profileUpdate.getEmail().isEmpty() && !profileUpdate.getEmail().equals(user.getEmail())) {
            String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
            if (!profileUpdate.getEmail().matches(emailRegex)) {
                throw new IllegalArgumentException("Invalid email format.");
            }
            if (userRepository.existsByEmail(profileUpdate.getEmail())) {
                throw new IllegalArgumentException("Email is already in use.");
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

        return savedUser;
    }

    public UserStatsDTO getDashboardStats(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserStatsDTO stats = UserStatsDTO.builder()
                .totalCourses(resourceRepository.countUniqueCoursesByUploader(user))
                .pendingTasks(studyTaskRepository.countByUserIdAndCompletedFalse(id))
                .sharedResources(resourceRepository.countByUploader(user))
                .soldItems(marketplaceItemRepository.countBySellerAndSoldTrue(user))
                .completedTasks(studyTaskRepository.countByUserIdAndCompletedTrue(id))
                .build();

        return stats;
    }

    public List<Activity> getActivities(Long id, Integer limit) {
        if (limit != null) {
            return activityRepository.findByUserIdOrderByTimestampDesc(id, PageRequest.of(0, limit));
        }
        return activityRepository.findByUserIdOrderByTimestampDesc(id);
    }

    public void deleteProfile(Long id, User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(id) && !"ADMIN".equals(currentUser.getRole()))) {
            throw new UnauthorizedActionException("You can only delete your own profile.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        List<com.studentos.backend.model.CourseReview> userReviews = reviewRepository.findAllByReviewer(user);
        if (!userReviews.isEmpty()) {
            List<Long> reviewIds = userReviews.stream().map(com.studentos.backend.model.CourseReview::getId).toList();
            notificationRepository.deleteByRelatedEntityIdIn(reviewIds);
            reviewRepository.deleteAll(userReviews);
        }

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
    }
}
