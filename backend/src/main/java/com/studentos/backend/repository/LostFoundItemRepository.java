package com.studentos.backend.repository;

import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reporter"})
    Optional<LostFoundItem> findById(Long id);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reporter"})
    List<LostFoundItem> findAllByOrderByResolvedAscReportedAtDesc();
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reporter"})
    List<LostFoundItem> findByTypeIgnoreCaseOrderByResolvedAscReportedAtDesc(String type);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reporter"})
    List<LostFoundItem> findAll();
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"reporter"})
    List<LostFoundItem> findAllByReporter(User reporter);
    long countByReporter(User reporter);
    @org.springframework.transaction.annotation.Transactional
    void deleteByReporter(User reporter);
}
