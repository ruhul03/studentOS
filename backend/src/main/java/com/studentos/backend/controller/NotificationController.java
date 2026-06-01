package com.studentos.backend.controller;

import com.studentos.backend.dto.NotificationRequest;
import com.studentos.backend.model.Notification;
import com.studentos.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@SuppressWarnings("null")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/broadcast")
    @Transactional
    public void broadcast(@RequestBody String message) {
        notificationService.broadcastMessage(message);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
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
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
