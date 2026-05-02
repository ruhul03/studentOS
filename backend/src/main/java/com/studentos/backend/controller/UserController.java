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
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userService.getUserProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id,
                                         @Valid @RequestBody ProfileUpdateRequest profileUpdate,
                                         @AuthenticationPrincipal User currentUser) {
        return userService.updateProfile(id, profileUpdate, currentUser);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long id) {
        return userService.getDashboardStats(id);
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<List<Activity>> getActivities(@PathVariable Long id, @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(userService.getActivities(id, limit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return userService.deleteProfile(id, currentUser);
    }
}
