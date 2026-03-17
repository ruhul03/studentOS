package com.studentos.backend.repository;

import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {
    List<LostFoundItem> findByResolvedFalseOrderByReportedAtDesc();
    List<LostFoundItem> findByTypeIgnoreCaseAndResolvedFalseOrderByReportedAtDesc(String type);
    List<LostFoundItem> findAllByReporter(User reporter);
    long countByReporter(User reporter);
    @org.springframework.transaction.annotation.Transactional
    void deleteByReporter(User reporter);
}
