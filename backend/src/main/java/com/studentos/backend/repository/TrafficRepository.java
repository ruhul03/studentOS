package com.studentos.backend.repository;

import com.studentos.backend.model.TrafficRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface TrafficRepository extends JpaRepository<TrafficRecord, Long> {

    @Query(value = "SELECT DATE(timestamp) as date, COUNT(*) as count FROM traffic_records " +
                   "WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) " +
                   "GROUP BY DATE(timestamp) ORDER BY DATE(timestamp) ASC", nativeQuery = true)
    List<Map<String, Object>> getDailyTrafficLast7Days();
}
