package com.studentos.backend.controller;

import com.studentos.backend.dto.MessageRequest;
import com.studentos.backend.model.Message;
import com.studentos.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Message>> getConversation(@RequestParam Long user1, @RequestParam Long user2) {
        return ResponseEntity.ok(messageService.getConversation(user1, user2));
    }
}
