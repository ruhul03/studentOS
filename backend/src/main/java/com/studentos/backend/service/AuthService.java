package com.studentos.backend.service;

import com.studentos.backend.dto.LoginRequest;
import com.studentos.backend.dto.RegisterRequest;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Transactional
    public User registerUser(RegisterRequest registration) throws IllegalArgumentException {
        String email = registration.getEmail() != null ? registration.getEmail().trim() : "";
        String username = registration.getUsername() != null ? registration.getUsername().trim() : "";

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        SecureRandom random = new SecureRandom();
        String verificationCode = String.format("%06d", random.nextInt(1000000));

        User user = User.builder()
                .name(registration.getName())
                .username(registration.getUsername())
                .email(registration.getEmail())
                .password(passwordEncoder.encode(registration.getPassword()))
                .role("STUDENT")
                .isVerified(false)
                .verificationCode(verificationCode)
                .verificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15))
                .updateCount(0)
                .build();

        User savedUser = userRepository.save(user);
        
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationCode);

        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole());
        savedUser.setToken(token);

        return savedUser;
    }

    @Transactional
    public boolean verifyEmail(String email, String code) {
        if (email == null || code == null) return false;

        return userRepository.findByEmailIgnoreCase(email.trim()).map(user -> {
            if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
                if (user.getVerificationCodeExpiresAt() != null && user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                    throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
                }
                user.setVerified(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
                return true;
            }
            return false;
        }).orElse(false);
    }

    @Transactional
    public void resendVerificationCode(String email) throws IllegalArgumentException {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("No user found with this email."));

        if (user.isVerified()) {
            throw new IllegalArgumentException("Account is already verified.");
        }

        SecureRandom random = new SecureRandom();
        String verificationCode = String.format("%06d", random.nextInt(1000000));
        
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verificationCode);
    }

    public User loginUser(LoginRequest loginRequest) throws IllegalArgumentException, SecurityException {
        String identifier = loginRequest.getEmail() != null ? loginRequest.getEmail().trim() : "";
        if (identifier.isBlank()) {
            throw new IllegalArgumentException("Email or username is required.");
        }

        Optional<User> userOptional = identifier.contains("@") 
            ? userRepository.findByEmailIgnoreCase(identifier) 
            : userRepository.findByUsernameIgnoreCase(identifier);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                if (!user.isVerified()) {
                    throw new SecurityException("Account not verified. Please verify your email.");
                }

                String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
                user.setToken(token);
                return user;
            }
        }
        throw new IllegalArgumentException("Invalid email/username or password.");
    }

    public Optional<String> forgotUsername(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim()).map(User::getUsername);
    }

    @Transactional
    public String requestPasswordReset(String email) throws IllegalArgumentException {
        return userRepository.findByEmailIgnoreCase(email.trim()).map(user -> {
            SecureRandom random = new SecureRandom();
            String verificationCode = String.format("%06d", random.nextInt(1000000));
            user.setVerificationCode(verificationCode);
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);
            
            emailService.sendPasswordResetEmail(user.getEmail(), verificationCode);
            
            return verificationCode;
        }).orElseThrow(() -> new IllegalArgumentException("No user found with this email."));
    }

    @Transactional
    public boolean resetPassword(String email, String code, String newPassword) throws IllegalArgumentException {
        if (code == null || code.isEmpty()) throw new IllegalArgumentException("Verification code is required.");
        if (newPassword == null || newPassword.isEmpty()) throw new IllegalArgumentException("New password is required.");

        return userRepository.findByEmailIgnoreCase(email.trim()).map(user -> {
            if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
                throw new IllegalArgumentException("Invalid verification code.");
            }
            
            if (user.getVerificationCodeExpiresAt() != null && user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
            }

            user.setVerified(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiresAt(null);
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }).orElseThrow(() -> new IllegalArgumentException("No user found with this email."));
    }
}
