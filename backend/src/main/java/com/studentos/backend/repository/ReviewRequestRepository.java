package com.studentos.backend.repository;

import com.studentos.backend.model.ReviewRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRequestRepository extends JpaRepository<ReviewRequest, Long> {
    List<ReviewRequest> findAllByOrderByCreatedAtDesc();

    @org.springframework.transaction.annotation.Transactional
    void deleteByRequester(com.studentos.backend.model.User requester);
}
