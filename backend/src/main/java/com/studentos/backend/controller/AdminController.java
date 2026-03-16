package com.studentos.backend.controller;

import com.studentos.backend.model.User;
import com.studentos.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final MarketplaceItemRepository marketplaceRepository;
    private final CampusEventRepository eventRepository;
    private final LostFoundItemRepository lostFoundRepository;

    public AdminController(UserRepository userRepository, 
                           ResourceRepository resourceRepository,
                           MarketplaceItemRepository marketplaceRepository,
                           CampusEventRepository eventRepository,
                           LostFoundItemRepository lostFoundRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.marketplaceRepository = marketplaceRepository;
        this.eventRepository = eventRepository;
        this.lostFoundRepository = lostFoundRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalMarketplaceItems", marketplaceRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalLostFoundItems", lostFoundRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> toggleUserRole(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    String currentRole = user.getRole();
                    user.setRole("ADMIN".equals(currentRole) ? "STUDENT" : "ADMIN");
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
