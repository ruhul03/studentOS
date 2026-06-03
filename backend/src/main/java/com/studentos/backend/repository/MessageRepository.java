package com.studentos.backend.repository;

import com.studentos.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);

    @org.springframework.transaction.annotation.Transactional
    void deleteBySenderIdOrReceiverId(Long senderId, Long receiverId);

    @Query(value = "SELECT m1.* FROM messages m1 LEFT JOIN messages m2 ON " +
            "((m1.sender_id = m2.sender_id AND m1.receiver_id = m2.receiver_id) OR " +
            "(m1.sender_id = m2.receiver_id AND m1.receiver_id = m2.sender_id)) " +
            "AND m1.timestamp < m2.timestamp " +
            "WHERE (m1.sender_id = :userId OR m1.receiver_id = :userId) AND m2.id IS NULL " +
            "ORDER BY m1.timestamp DESC", nativeQuery = true)
    List<Message> findRecentConversations(@Param("userId") Long userId);
}
