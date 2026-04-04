package com.studentos.backend.repository;

import com.studentos.backend.model.StudyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {
    List<StudyTask> findByUserIdOrderByDueDateAsc(Long userId);
    List<StudyTask> findByUserIdAndCompletedOrderByDueDateAsc(Long userId, boolean completed);
    long countByUserIdAndCompletedFalse(Long userId);
    long countByUserIdAndCompletedTrue(Long userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);
}
