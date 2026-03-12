package com.studentos.backend.controller;

import com.studentos.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/broadcast")
    public void broadcast(@RequestBody String message) {
        notificationService.sendGlobalNotification(message);
    }
}
