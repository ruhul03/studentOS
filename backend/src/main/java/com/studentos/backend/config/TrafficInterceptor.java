package com.studentos.backend.config;

import com.studentos.backend.model.TrafficRecord;
import com.studentos.backend.repository.TrafficRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TrafficInterceptor implements HandlerInterceptor {

    private final TrafficRepository trafficRepository;

    public TrafficInterceptor(TrafficRepository trafficRepository) {
        this.trafficRepository = trafficRepository;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Log all API requests
        if (request.getRequestURI().startsWith("/api/")) {
            TrafficRecord record = TrafficRecord.builder()
                    .endpoint(request.getRequestURI())
                    .method(request.getMethod())
                    .clientIp(getRelativeIp(request))
                    .build();
            
            // For simple traffic analysis, we save every hit. 
            // In a high-traffic app, we'd batch these or use Redis.
            try {
                trafficRepository.save(record);
            } catch (Exception e) {
                // Don't fail the request if logging fails
                System.err.println("Traffic logging failed: " + e.getMessage());
            }
        }
    }

    private String getRelativeIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null) return xf.split(",")[0];
        return request.getRemoteAddr();
    }
}
