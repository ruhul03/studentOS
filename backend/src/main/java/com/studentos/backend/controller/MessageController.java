package com.studentos.backend.controller;

import com.studentos.backend.dto.MessageRequest;
import com.studentos.backend.model.Message;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MessageRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageController(MessageRepository messageRepository, 
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    @Transactional
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest request) {
        Message message = Message.builder()
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .build();
        Message saved = messageRepository.save(message);

        // Notify the receiver in real-time
        notificationService.sendDirectMessageNotification(request.getReceiverId(), saved);

        // Create a persistent notification for the message
        User sender = userRepository.findById(request.getSenderId()).orElse(null);
        String senderName = (sender != null) ? sender.getName() : "Someone";
        
        notificationService.createAndSendNotification(
            request.getReceiverId(),
            "direct_message",
            "New Message",
            "You received a new message from " + senderName,
            request.getSenderId(),
            null // Message ID or conversation context could go here
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam Long user1, @RequestParam Long user2) {
        return messageRepository.findConversation(user1, user2);
    }
}
