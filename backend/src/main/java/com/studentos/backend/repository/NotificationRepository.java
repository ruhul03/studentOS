package com.studentos.backend.repository;

import com.studentos.backend.model.Notification;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByRecipient(User recipient);

    @org.springframework.transaction.annotation.Transactional
    void deleteBySender(User sender);
}
