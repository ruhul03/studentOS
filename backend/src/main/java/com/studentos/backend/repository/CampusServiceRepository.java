package com.studentos.backend.repository;

import com.studentos.backend.model.CampusService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusServiceRepository extends JpaRepository<CampusService, Long> {
    List<CampusService> findByCategoryIgnoreCase(String category);
    List<CampusService> findByNameIgnoreCaseContaining(String name);
}
