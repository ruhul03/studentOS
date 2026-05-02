package com.studentos.backend.service;

import com.studentos.backend.model.Notification;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.NotificationRepository;
import com.studentos.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(SimpMessagingTemplate messagingTemplate, 
                               NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void sendGlobalNotification(Object payload) {
        messagingTemplate.convertAndSend("/topic/notifications", payload);
    }

    public void sendPrivateNotification(Long userId, Object payload) {
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, payload);
    }

    public void sendDirectMessageNotification(Long userId, Object payload) {
        messagingTemplate.convertAndSend("/topic/messages/" + userId, payload);
    }

    public Notification createAndSendNotification(Long recipientId, String type, String title, String message, Long senderId, Long relatedId) {
        User recipient = userRepository.findById(recipientId).orElse(null);
        User sender = senderId != null ? userRepository.findById(senderId).orElse(null) : null;
        
        if (recipient == null) return null;

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityId(relatedId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        
        // Send real-time
        sendPrivateNotification(recipientId, saved);
        
        return saved;
    }
}
