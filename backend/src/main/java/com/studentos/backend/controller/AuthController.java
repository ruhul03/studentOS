package com.studentos.backend.controller;

import com.studentos.backend.dto.ForgotRequest;
import com.studentos.backend.dto.LoginRequest;
import com.studentos.backend.dto.RegisterRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.studentos.backend.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registration) {
        if (userRepository.existsByEmail(registration.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered.");
        }
        
        if (userRepository.existsByUsername(registration.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken.");
        }
        
        // Generate a 6-digit verification code
        String verificationCode = String.format("%06d", new java.util.Random().nextInt(1000000));
        log.warn("VERIFICATION CODE FOR {}: {}", registration.getEmail(), verificationCode);

        User user = User.builder()
                .name(registration.getName())
                .username(registration.getUsername())
                .email(registration.getEmail())
                .password(passwordEncoder.encode(registration.getPassword()))
                .role("STUDENT")
                .isVerified(false)
                .verificationCode(verificationCode)
                .updateCount(0)
                .build();
        
        User savedUser = userRepository.save(user);
        
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole());
        savedUser.setToken(token);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verifyEmail(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email and code are required.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
                user.setVerified(true);
                user.setVerificationCode(null);
                userRepository.save(user);
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Email verified successfully."));
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        String identifier = loginRequest.getEmail();
        Optional<User> userOptional;
        
        if (identifier.contains("@")) {
            userOptional = userRepository.findByEmail(identifier);
        } else {
            userOptional = userRepository.findByUsername(identifier);
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                if (!user.isVerified()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account not verified. Please verify your email.");
                }
                
                String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
                user.setToken(token);
                
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email/username or password.");
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@Valid @RequestBody ForgotRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            return ResponseEntity.ok(java.util.Collections.singletonMap("username", userOptional.get().getUsername()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }

    @PostMapping("/request-password-reset")
    @Transactional
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ForgotRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String verificationCode = String.format("%06d", new java.util.Random().nextInt(1000000));
            log.warn("PASSWORD RESET CODE FOR {}: {}", user.getEmail(), verificationCode);
            user.setVerificationCode(verificationCode);
            userRepository.save(user);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Reset code generated. Please check your email/console."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ForgotRequest request) {
        if (request.getCode() == null || request.getCode().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Verification code is required.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New password is required.");
        }

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode())) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired verification code.");
            }
            
            user.setVerified(true);
            user.setVerificationCode(null);
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password reset successfully."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
    }
}
