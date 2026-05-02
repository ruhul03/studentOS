package com.studentos.backend.controller;

import com.studentos.backend.dto.NotificationRequest;
import com.studentos.backend.model.Notification;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.NotificationRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, 
                                  NotificationRepository notificationRepository,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/broadcast")
    @Transactional
    public void broadcast(@RequestBody String message) {
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("type", "broadcast");
        payload.put("title", "Admin Broadcast");
        payload.put("message", message);
        payload.put("createdAt", java.time.LocalDateTime.now());
        notificationService.sendGlobalNotification(payload);
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return notificationRepository.findByRecipientOrderByCreatedAtDesc(userOpt.get());
        }
        return List.of();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Notification> createNotification(@Valid @RequestBody NotificationRequest request) {
        Notification notification = notificationService.createAndSendNotification(
                request.getRecipientId(),
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getSenderId(),
                request.getRelatedEntityId()
        );
        if (notification != null) {
            return ResponseEntity.ok(notification);
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification notification = notifOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
