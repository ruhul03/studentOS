package com.studentos.backend.repository;

import com.studentos.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(String courseCode, String title);
    List<Resource> findAllByOrderByUpvotesDesc();
}
