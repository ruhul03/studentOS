package com.studentos.backend.controller;

import com.studentos.backend.model.User;
import com.studentos.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testLoginSuccess() {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("test_user");
        mockUser.setEmail("test@student.com");
        mockUser.setPassword("password123");
        mockUser.setRole("STUDENT");

        Mockito.when(userRepository.findByEmail("test@student.com")).thenReturn(Optional.of(mockUser));
        Mockito.when(passwordEncoder.matches("password123", "password123")).thenReturn(true);

        LoginRequest req = new LoginRequest();
        req.setEmail("test@student.com");
        req.setPassword("password123");

        ResponseEntity<?> response = authController.loginUser(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    public void testLoginFailure() {
        Mockito.when(userRepository.findByEmail("wrong@student.com")).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail("wrong@student.com");
        req.setPassword("wrongpassword");

        ResponseEntity<?> response = authController.loginUser(req);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
