package com.studentos.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final TrafficInterceptor trafficInterceptor;

    public WebConfig(TrafficInterceptor trafficInterceptor) {
        this.trafficInterceptor = trafficInterceptor;
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("authorization", "content-type", "x-auth-token", "X-User-Id", "X-User-Role")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    @SuppressWarnings("null")
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(trafficInterceptor);
    }
}
