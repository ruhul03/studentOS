package com.studentos.backend.controller;

import com.studentos.backend.model.*;
import com.studentos.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        if (adminService.deleteUser(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> toggleUserRole(@PathVariable("id") Long id) {
        return adminService.toggleUserRole(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Resource Management
    @GetMapping("/resources")
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(adminService.getAllResources());
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable("id") Long id) {
        if (adminService.deleteResource(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Marketplace Management
    @GetMapping("/marketplace")
    public ResponseEntity<List<MarketplaceItem>> getAllMarketplaceItems() {
        return ResponseEntity.ok(adminService.getAllMarketplaceItems());
    }

    @DeleteMapping("/marketplace/{id}")
    public ResponseEntity<?> deleteMarketplaceItem(@PathVariable("id") Long id) {
        if (adminService.deleteMarketplaceItem(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Event Management
    @GetMapping("/events")
    public ResponseEntity<List<CampusEvent>> getAllEvents() {
        return ResponseEntity.ok(adminService.getAllEvents());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable("id") Long id) {
        if (adminService.deleteEvent(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // User Insights & Activity
    @GetMapping("/users/{id}/activity")
    public ResponseEntity<Map<String, Object>> getUserActivity(@PathVariable("id") Long id) {
        return adminService.getUserActivity(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/traffic")
    public ResponseEntity<List<Map<String, Object>>> getTrafficStats() {
        return ResponseEntity.ok(adminService.getDailyTrafficLast7Days());
    }

    @GetMapping("/analytics/growth")
    public ResponseEntity<List<Map<String, Object>>> getGrowthStats() {
        return ResponseEntity.ok(adminService.getRegistrationGrowth());
    }

    @GetMapping("/analytics/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentStats() {
        return ResponseEntity.ok(adminService.getDepartmentDistribution());
    }

    @GetMapping("/analytics/contributors")
    public ResponseEntity<List<Map<String, Object>>> getTopContributors() {
        return ResponseEntity.ok(adminService.getTopContributors());
    }
}
