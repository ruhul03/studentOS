package com.studentos.backend.controller;

import com.studentos.backend.dto.ForgotRequest;
import com.studentos.backend.dto.LoginRequest;
import com.studentos.backend.dto.RegisterRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to call APIs
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registration) {
        // Enforce UIU email domain extension
        String emailRegex = "^[\\w-\\.]+@([\\w-]+\\.)?uiu\\.ac\\.bd$";
        if (registration.getEmail() == null || !registration.getEmail().matches(emailRegex)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please provide a valid UIU email address (e.g., student@bscse.uiu.ac.bd).");
        }

        if (userRepository.existsByEmail(registration.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered.");
        }
        
        if (registration.getUsername() == null || registration.getUsername().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is required.");
        }

        if (userRepository.existsByUsername(registration.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken.");
        }
        
        // Generate a 6-digit verification code
        String verificationCode = String.format("%06d", new java.util.Random().nextInt(1000000));
        System.out.println("VERIFICATION CODE FOR " + registration.getEmail() + ": " + verificationCode);

        User user = User.builder()
                .name(registration.getName() != null ? registration.getName() : registration.getUsername())
                .username(registration.getUsername())
                .email(registration.getEmail())
                .password(passwordEncoder.encode(registration.getPassword()))
                .role("STUDENT")
                .isVerified(false)
                .verificationCode(verificationCode)
                .updateCount(0)
                .build();
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verifyEmail(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
                user.setVerified(true);
                user.setVerificationCode(null);
                userRepository.save(user);
                return ResponseEntity.ok("Email verified successfully.");
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        String identifier = loginRequest.getEmail();
        Optional<User> userOptional;
        
        if (identifier == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username/Email is required.");
        }

        if (identifier.contains("@")) {
            userOptional = userRepository.findByEmail(identifier);
        } else {
            // Find by username logic
            userOptional = userRepository.findAll().stream()
                .filter(u -> identifier.equals(u.getUsername()))
                .findFirst();
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                if (!user.isVerified()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account not verified. Please verify your email.");
                }
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email/username or password.");
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@RequestBody ForgotRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required.");
        }
        
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            return ResponseEntity.ok(java.util.Collections.singletonMap("username", userOptional.get().getUsername()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody ForgotRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New password is required.");
        }

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok("Password reset successfully.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }
}
