package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_msg_sender", columnList = "senderId"),
    @Index(name = "idx_msg_receiver", columnList = "receiverId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private boolean deletedBySender = false;

    @Builder.Default
    private boolean deletedByReceiver = false;

    @Builder.Default
    private boolean deletedForEveryone = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
