package com.studentos.backend.service;

import com.studentos.backend.dto.ConversationSummaryDTO;
import com.studentos.backend.dto.MessageRequest;
import com.studentos.backend.model.Message;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MessageRepository;
import com.studentos.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository, 
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Message sendMessage(MessageRequest request) {
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

        return saved;
    }

    public List<Message> getConversation(Long user1, Long user2) {
        return messageRepository.findConversation(user1, user2);
    }

    public List<ConversationSummaryDTO> getRecentConversations(Long userId) {
        List<Message> recentMessages = messageRepository.findRecentConversations(userId);
        List<ConversationSummaryDTO> summaries = new ArrayList<>();
        
        for (Message msg : recentMessages) {
            Long otherUserId = msg.getSenderId().equals(userId) ? msg.getReceiverId() : msg.getSenderId();
            Optional<User> otherUserOpt = userRepository.findById(otherUserId);
            if (otherUserOpt.isPresent()) {
                summaries.add(ConversationSummaryDTO.builder()
                        .otherUser(otherUserOpt.get())
                        .latestMessage(msg)
                        .build());
            }
        }
        return summaries;
    }
}
