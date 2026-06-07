package com.studentos.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Slf4j
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    private final HttpClient httpClient;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    private void sendResendEmail(String to, String subject, String text) {
        if (resendApiKey == null || resendApiKey.isEmpty() || resendApiKey.equals("default_key_here")) {
            log.warn("Resend API key is missing. Skipping email send. (OTP was logged above)");
            return; // Skip sending if key isn't configured so it doesn't fail registration
        }

        try {
            // Escape the text to prevent JSON injection
            String escapedText = text.replace("\n", "\\n").replace("\"", "\\\"");
            
            String jsonBody = String.format(
                "{\"from\":\"%s\",\"to\":\"%s\",\"subject\":\"%s\",\"text\":\"%s\"}",
                fromEmail, to, subject, escapedText
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                log.warn("Failed to send email via Resend. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new IllegalArgumentException("Failed to send email. Please check your Resend configuration.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Email sending was interrupted.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Exception sending email via Resend: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to send email due to a network error.");
        }
    }

    public void sendVerificationEmail(String to, String code) {
        log.info("REGISTRATION OTP FOR {}: {}", to, code);
        String subject = "StudentOS - Verify your Email";
        String text = "Welcome to StudentOS!\n\nYour email verification code is: " + code + "\n\nThis code will expire in 15 minutes.\n\nThanks,\nThe StudentOS Team";
        sendResendEmail(to, subject, text);
    }

    public void sendPasswordResetEmail(String to, String code) {
        log.info("PASSWORD RESET OTP FOR {}: {}", to, code);
        String subject = "StudentOS - Password Reset Request";
        String text = "Hello,\n\nYou requested a password reset for your StudentOS account.\n\nYour reset code is: " + code + "\n\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe StudentOS Team";
        sendResendEmail(to, subject, text);
    }
}
