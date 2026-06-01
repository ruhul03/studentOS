package com.studentos.backend.service;

import com.studentos.backend.model.*;
import com.studentos.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class AdminService {

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

    public AdminService(UserRepository userRepository,
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

    public Map<String, Long> getSystemStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalMarketplaceItems", marketplaceRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalLostFoundItems", lostFoundRepository.count());
        return stats;
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();

        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        double memoryUsage = (double) usedMemory / totalMemory * 100;

        health.put("memoryUsage", Math.round(memoryUsage * 100.0) / 100.0);
        health.put("totalMemory", totalMemory / (1024 * 1024)); // MB
        health.put("usedMemory", usedMemory / (1024 * 1024)); // MB
        health.put("uptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime());
        health.put("dbStatus", "CONNECTED");
        health.put("activeSessions", userRepository.count());
        health.put("cpuLoad", 15.5); // Placeholder

        return health;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public boolean deleteUser(Long id) {
        return userRepository.findById(id).map(user -> {
            // Manual cascade for administrative safety - Purge all user footprints
            List<CourseReview> userReviews = reviewRepository.findAllByReviewer(user);
            if (!userReviews.isEmpty()) {
                List<Long> reviewIds = userReviews.stream().map(CourseReview::getId).toList();
                notificationRepository.deleteByRelatedEntityIdIn(reviewIds);
                reviewRepository.deleteAll(userReviews);
            }

            notificationRepository.deleteBySender(user);
            resourceRepository.deleteByUploader(user);
            marketplaceRepository.deleteBySeller(user);
            lostFoundRepository.deleteByReporter(user);
            eventRepository.deleteByUploaderId(id);
            activityRepository.deleteByUserId(id);
            commentRepository.deleteByCommenter(user);
            notificationRepository.deleteByRecipient(user);
            messageRepository.deleteBySenderIdOrReceiverId(id, id);
            taskRepository.deleteByUserId(id);
            reviewRequestRepository.deleteByRequester(user);
            tuitionFeeRepository.deleteByUserId(id);

            userRepository.delete(user);
            return true;
        }).orElse(false);
    }

    @Transactional
    public Optional<User> toggleUserRole(Long id) {
        return userRepository.findById(id).map(user -> {
            String currentRole = user.getRole();
            user.setRole("ADMIN".equals(currentRole) ? "STUDENT" : "ADMIN");
            return userRepository.save(user);
        });
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Transactional
    public boolean deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) return false;
        resourceRepository.deleteById(id);
        return true;
    }

    public List<MarketplaceItem> getAllMarketplaceItems() {
        return marketplaceRepository.findAll();
    }

    @Transactional
    public boolean deleteMarketplaceItem(Long id) {
        if (!marketplaceRepository.existsById(id)) return false;
        marketplaceRepository.deleteById(id);
        return true;
    }

    public List<CampusEvent> getAllEvents() {
        return eventRepository.findAll();
    }

    @Transactional
    public boolean deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) return false;
        eventRepository.deleteById(id);
        return true;
    }

    public Optional<Map<String, Object>> getUserActivity(Long id) {
        return userRepository.findById(id).map(user -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("user", user);
            activity.put("resources", resourceRepository.findAllByUploader(user));
            activity.put("marketplace", marketplaceRepository.findAllBySeller(user));
            activity.put("events", eventRepository.findAllByUploaderId(id));
            activity.put("lostFound", lostFoundRepository.findAllByReporter(user));
            return activity;
        });
    }

    public List<Map<String, Object>> getDailyTrafficLast7Days() {
        return trafficRepository.getDailyTrafficLast7Days();
    }

    public List<Map<String, Object>> getRegistrationGrowth() {
        return userRepository.getRegistrationGrowth();
    }

    public List<Map<String, Object>> getDepartmentDistribution() {
        return userRepository.getDepartmentDistribution();
    }

    // Using standard stream to aggregate counts without exhausting ForkJoin pool
    public List<Map<String, Object>> getTopContributors() {
        List<User> users = userRepository.findAll();
        
        return users.stream()
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
                .sorted((a, b) -> Long.compare((long) b.get("totalContributions"), (long) a.get("totalContributions")))
                .limit(5)
                .toList();
    }
}
