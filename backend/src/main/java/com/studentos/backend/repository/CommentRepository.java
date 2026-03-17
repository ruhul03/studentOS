package com.studentos.backend.repository;

import com.studentos.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByReviewIdOrderByCreatedAtAsc(Long reviewId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByCommenter(com.studentos.backend.model.User commenter);

    @org.springframework.transaction.annotation.Transactional
    void deleteByReviewIn(List<com.studentos.backend.model.CourseReview> reviews);
}
