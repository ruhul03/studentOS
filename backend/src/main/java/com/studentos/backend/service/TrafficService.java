package com.studentos.backend.service;

import com.studentos.backend.model.TrafficRecord;
import com.studentos.backend.repository.TrafficRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TrafficService {

    private final TrafficRepository trafficRepository;

    public TrafficService(TrafficRepository trafficRepository) {
        this.trafficRepository = trafficRepository;
    }

    @Async
    public void logTraffic(String uri, String method, String clientIp) {
        TrafficRecord record = TrafficRecord.builder()
                .endpoint(uri)
                .method(method)
                .clientIp(clientIp)
                .build();
        
        try {
            trafficRepository.save(record);
        } catch (Exception e) {
            // Silently fail as logging is non-critical
            System.err.println("Async Traffic logging failed: " + e.getMessage());
        }
    }
}
