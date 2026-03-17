package com.studentos.backend.repository;

import com.studentos.backend.model.CampusEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusEventRepository extends JpaRepository<CampusEvent, Long> {
    List<CampusEvent> findAllByOrderByEventDateAsc();
    List<CampusEvent> findAllByUploaderId(Long uploaderId);
    long countByUploaderId(Long uploaderId);
    @org.springframework.transaction.annotation.Transactional
    void deleteByUploaderId(Long uploaderId);
}
