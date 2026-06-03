package com.studentos.backend.repository;

import com.studentos.backend.model.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reviewer"})
    List<CourseReview> findByCourseCodeIgnoreCaseOrderByCreatedAtDesc(String courseCode);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reviewer"})
    List<CourseReview> findAllByOrderByCreatedAtDesc();
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reviewer"})
    List<CourseReview> findAllByReviewer(com.studentos.backend.model.User reviewer);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByReviewer(com.studentos.backend.model.User reviewer);
}
