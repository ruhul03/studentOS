package com.studentos.backend.repository;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(String courseCode, String title);
    List<Resource> findAllByOrderByUpvotesDesc();
    
    long countByUploader(User uploader);
    
    @Query("SELECT COUNT(DISTINCT r.courseCode) FROM Resource r WHERE r.uploader = :uploader")
    long countUniqueCoursesByUploader(@Param("uploader") User uploader);
}
