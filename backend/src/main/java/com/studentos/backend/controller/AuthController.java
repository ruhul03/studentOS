package com.studentos.backend.controller;

import com.studentos.backend.dto.ForgotRequest;
import com.studentos.backend.dto.LoginRequest;
import com.studentos.backend.dto.RegisterRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registration) {
        try {
            User savedUser = authService.registerUser(registration);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        if (authService.verifyEmail(request.get("email"), request.get("code"))) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Email verified successfully."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code or email.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        try {
            authService.resendVerificationCode(request.get("email"));
            return ResponseEntity.ok(Collections.singletonMap("message", "A new verification code has been sent."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = authService.loginUser(loginRequest);
            return ResponseEntity.ok(user);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@Valid @RequestBody ForgotRequest request) {
        Optional<String> username = authService.forgotUsername(request.getEmail());
        if (username.isPresent()) {
            return ResponseEntity.ok(Collections.singletonMap("username", username.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ForgotRequest request) {
        try {
            String code = authService.requestPasswordReset(request.getEmail());
            // code is logged by EmailService now
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reset code generated. Please check your email.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ForgotRequest request) {
        try {
            if (authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword())) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Password reset successfully."));
            }
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("No user")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to reset password.");
    }
}
