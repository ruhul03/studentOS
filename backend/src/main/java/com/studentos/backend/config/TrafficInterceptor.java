package com.studentos.backend.config;

import com.studentos.backend.service.TrafficService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TrafficInterceptor implements HandlerInterceptor {

    private final TrafficService trafficService;

    public TrafficInterceptor(TrafficService trafficService) {
        this.trafficService = trafficService;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, 
                                @NonNull HttpServletResponse response, 
                                @NonNull Object handler, 
                                @Nullable Exception ex) {
        // Log API traffic asynchronously
        trafficService.logTraffic(
            request.getRequestURI(), 
            request.getMethod(), 
            getClientIp(request)
        );
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || remoteAddr.isEmpty()) {
                remoteAddr = request.getRemoteAddr();
            } else {
                remoteAddr = remoteAddr.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }
}
