package com.studentos.backend.config;

import com.studentos.backend.service.TrafficService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TrafficInterceptor implements HandlerInterceptor {

    private final TrafficService trafficService;

    public TrafficInterceptor(TrafficService trafficService) {
        this.trafficService = trafficService;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Log all API requests asynchronously
        if (request.getRequestURI().startsWith("/api/")) {
            trafficService.logTraffic(
                request.getRequestURI(), 
                request.getMethod(), 
                getRelativeIp(request)
            );
        }
    }

    private String getRelativeIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null) return xf.split(",")[0];
        return request.getRemoteAddr();
    }
}
