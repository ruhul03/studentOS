package com.studentos.backend.repository;

import com.studentos.backend.model.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {
    List<CourseReview> findByCourseCodeIgnoreCaseOrderByCreatedAtDesc(String courseCode);
    List<CourseReview> findAllByOrderByCreatedAtDesc();
}
