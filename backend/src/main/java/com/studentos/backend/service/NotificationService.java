package com.studentos.backend.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendGlobalNotification(String message) {
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }

    public void sendPrivateNotification(Long userId, Object payload) {
        // payload can be a message object or a simple notification string
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", payload);
    }
}
