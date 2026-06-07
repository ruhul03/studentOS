package com.studentos.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String to, String code) {
        log.info("REGISTRATION OTP FOR {}: {}", to, code);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("StudentOS - Verify your Email");
        message.setText("Welcome to StudentOS!\n\nYour email verification code is: " + code + "\n\nThis code will expire in 15 minutes.\n\nThanks,\nThe StudentOS Team");
        mailSender.send(message);
    }

    @Async
    public void sendPasswordResetEmail(String to, String code) {
        log.info("PASSWORD RESET OTP FOR {}: {}", to, code);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("StudentOS - Password Reset Request");
        message.setText("Hello,\n\nYou requested a password reset for your StudentOS account.\n\nYour reset code is: " + code + "\n\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe StudentOS Team");
        mailSender.send(message);
    }
}
