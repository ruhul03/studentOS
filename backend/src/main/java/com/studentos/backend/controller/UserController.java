package com.studentos.backend.controller;

import com.studentos.backend.dto.ProfileUpdateRequest;
import com.studentos.backend.model.Activity;
import com.studentos.backend.model.User;
import com.studentos.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@SuppressWarnings("null")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable("id") Long id) {
        return userService.getUserProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable("id") Long id,
                                         @Valid @RequestBody ProfileUpdateRequest profileUpdate,
                                         @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateProfile(id, profileUpdate, currentUser));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getDashboardStats(id));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable("id") Long id, @RequestParam(value = "limit", required = false) Integer limit) {
        return ResponseEntity.ok(userService.getActivities(id, limit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProfile(@PathVariable("id") Long id, @AuthenticationPrincipal User currentUser) {
        userService.deleteProfile(id, currentUser);
        return ResponseEntity.ok("Profile and all associated data deleted successfully.");
    }
}
