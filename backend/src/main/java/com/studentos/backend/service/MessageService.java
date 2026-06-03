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

        return saved;
    }

    public int getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalseAndDeletedByReceiverFalse(userId);
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

    public void deleteMessage(Long messageId, Long currentUserId, String mode) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));

        if ("for_everyone".equals(mode)) {
            if (!message.getSenderId().equals(currentUserId)) {
                throw new RuntimeException("Only sender can delete for everyone");
            }
            message.setDeletedForEveryone(true);
            message.setContent("This message was deleted");
            messageRepository.save(message);
        } else if ("for_me".equals(mode)) {
            if (message.getSenderId().equals(currentUserId)) {
                message.setDeletedBySender(true);
            } else if (message.getReceiverId().equals(currentUserId)) {
                message.setDeletedByReceiver(true);
            }
            
            if (message.isDeletedBySender() && message.isDeletedByReceiver()) {
                messageRepository.delete(message);
            } else {
                messageRepository.save(message);
            }
        }
    }

    public void clearConversation(Long currentUserId, Long otherUserId) {
        List<Message> conversation = messageRepository.findConversation(currentUserId, otherUserId);
        for (Message msg : conversation) {
            if (msg.getSenderId().equals(currentUserId)) {
                msg.setDeletedBySender(true);
            } else {
                msg.setDeletedByReceiver(true);
            }
            if (msg.isDeletedBySender() && msg.isDeletedByReceiver()) {
                messageRepository.delete(msg);
            } else {
                messageRepository.save(msg);
            }
        }
    }

    public void markAsRead(Long currentUserId, Long otherUserId) {
        List<Message> unread = messageRepository.findByReceiverIdAndIsReadFalseAndDeletedByReceiverFalse(currentUserId);
        for (Message msg : unread) {
            if (msg.getSenderId().equals(otherUserId)) {
                msg.setRead(true);
                messageRepository.save(msg);
            }
        }
    }
}
