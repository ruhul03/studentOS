package com.studentos.backend.controller;

import com.studentos.backend.dto.ConversationSummaryDTO;
import com.studentos.backend.dto.MessageRequest;
import com.studentos.backend.model.Message;
import com.studentos.backend.model.User;
import com.studentos.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@SuppressWarnings("null")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest request) {
        Message saved = messageService.sendMessage(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam("user1") Long user1,
            @RequestParam("user2") Long user2) {
        return ResponseEntity.ok(messageService.getConversation(user1, user2));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<ConversationSummaryDTO>> getInbox(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(messageService.getRecentConversations(currentUser.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(messageService.getUnreadCount(currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable("id") Long id,
            @RequestParam(value = "mode", defaultValue = "for_me") String mode,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        messageService.deleteMessage(id, currentUser.getId(), mode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation/{otherUserId}")
    public ResponseEntity<Void> clearConversation(
            @PathVariable("otherUserId") Long otherUserId,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        messageService.clearConversation(currentUser.getId(), otherUserId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read/{otherUserId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("otherUserId") Long otherUserId,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(401).build();
        messageService.markAsRead(currentUser.getId(), otherUserId);
        return ResponseEntity.ok().build();
    }
}
