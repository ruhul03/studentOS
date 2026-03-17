package com.studentos.backend.controller;

import com.studentos.backend.model.*;
import com.studentos.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final MarketplaceItemRepository marketplaceRepository;
    private final CampusEventRepository eventRepository;
    private final LostFoundItemRepository lostFoundRepository;
    private final TrafficRepository trafficRepository;
    private final ActivityRepository activityRepository;
    private final CommentRepository commentRepository;
    private final CourseReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final MessageRepository messageRepository;
    private final StudyTaskRepository taskRepository;
    private final ReviewRequestRepository reviewRequestRepository;
    private final TuitionFeeRepository tuitionFeeRepository;

    public AdminController(UserRepository userRepository, 
                           ResourceRepository resourceRepository,
                           MarketplaceItemRepository marketplaceRepository,
                           CampusEventRepository eventRepository,
                           LostFoundItemRepository lostFoundRepository,
                           TrafficRepository trafficRepository,
                           ActivityRepository activityRepository,
                           CommentRepository commentRepository,
                           CourseReviewRepository reviewRepository,
                           NotificationRepository notificationRepository,
                           MessageRepository messageRepository,
                           StudyTaskRepository taskRepository,
                           ReviewRequestRepository reviewRequestRepository,
                           TuitionFeeRepository tuitionFeeRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.marketplaceRepository = marketplaceRepository;
        this.eventRepository = eventRepository;
        this.lostFoundRepository = lostFoundRepository;
        this.trafficRepository = trafficRepository;
        this.activityRepository = activityRepository;
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.messageRepository = messageRepository;
        this.taskRepository = taskRepository;
        this.reviewRequestRepository = reviewRequestRepository;
        this.tuitionFeeRepository = tuitionFeeRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalMarketplaceItems", marketplaceRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalLostFoundItems", lostFoundRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Manual cascade for administrative safety - Purge all user footprints
                    
                    // 1. Handle indirect dependencies for CourseReviews
                    List<com.studentos.backend.model.CourseReview> userReviews = reviewRepository.findAllByReviewer(user);
                    if (!userReviews.isEmpty()) {
                        commentRepository.deleteByReviewIn(userReviews);
                    }
                    
                    // 2. Clear sent notifications (where user is sender)
                    notificationRepository.deleteBySender(user);
                    
                    // 3. Normal cascading deletes
                    resourceRepository.deleteByUploader(user);
                    marketplaceRepository.deleteBySeller(user);
                    lostFoundRepository.deleteByReporter(user);
                    eventRepository.deleteByUploaderId(id);
                    activityRepository.deleteByUserId(id);
                    commentRepository.deleteByCommenter(user);
                    reviewRepository.deleteByReviewer(user);
                    notificationRepository.deleteByRecipient(user);
                    messageRepository.deleteBySenderIdOrReceiverId(id, id);
                    taskRepository.deleteByUserId(id);
                    reviewRequestRepository.deleteByRequester(user);
                    tuitionFeeRepository.deleteByUserId(id);
                    
                    userRepository.delete(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> toggleUserRole(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    String currentRole = user.getRole();
                    user.setRole("ADMIN".equals(currentRole) ? "STUDENT" : "ADMIN");
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Resource Management
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) return ResponseEntity.notFound().build();
        resourceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Marketplace Management
    @GetMapping("/marketplace")
    public ResponseEntity<?> getAllMarketplaceItems() {
        return ResponseEntity.ok(marketplaceRepository.findAll());
    }

    @DeleteMapping("/marketplace/{id}")
    public ResponseEntity<?> deleteMarketplaceItem(@PathVariable Long id) {
        if (!marketplaceRepository.existsById(id)) return ResponseEntity.notFound().build();
        marketplaceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Event Management
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) return ResponseEntity.notFound().build();
        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // User Insights & Activity
    @GetMapping("/users/{id}/activity")
    public ResponseEntity<?> getUserActivity(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("user", user);
                    activity.put("resources", resourceRepository.findAllByUploader(user));
                    activity.put("marketplace", marketplaceRepository.findAllBySeller(user));
                    activity.put("events", eventRepository.findAllByUploaderId(id));
                    activity.put("lostFound", lostFoundRepository.findAllByReporter(user));
                    return ResponseEntity.ok(activity);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/traffic")
    public ResponseEntity<List<Map<String, Object>>> getTrafficStats() {
        return ResponseEntity.ok(trafficRepository.getDailyTrafficLast7Days());
    }

    @GetMapping("/analytics/growth")
    public ResponseEntity<List<Map<String, Object>>> getGrowthStats() {
        return ResponseEntity.ok(userRepository.getRegistrationGrowth());
    }

    @GetMapping("/analytics/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentStats() {
        return ResponseEntity.ok(userRepository.getDepartmentDistribution());
    }

    @GetMapping("/analytics/contributors")
    public ResponseEntity<List<Map<String, Object>>> getTopContributors() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> contributors = users.stream()
                .map(user -> {
                    long total = resourceRepository.countByUploader(user) +
                                 marketplaceRepository.countBySeller(user) +
                                 eventRepository.countByUploaderId(user.getId()) +
                                 lostFoundRepository.countByReporter(user);
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", user.getName());
                    map.put("username", user.getUsername());
                    map.put("totalContributions", total);
                    return map;
                })
                .sorted((a, b) -> Long.compare((long)b.get("totalContributions"), (long)a.get("totalContributions")))
                .limit(5)
                .toList();
        return ResponseEntity.ok(contributors);
    }
}
