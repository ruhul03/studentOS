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

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.from.email:your_email@gmail.com}")
    private String fromEmail;

    @Value("${brevo.from.name:StudentOS}")
    private String fromName;

    private final HttpClient httpClient;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    private void sendBrevoEmail(String to, String subject, String text) {
        if (brevoApiKey == null || brevoApiKey.isEmpty() || brevoApiKey.equals("default_key_here")) {
            log.warn("Brevo API key is missing. Skipping email send. (OTP was logged above)");
            return; // Skip sending if key isn't configured
        }

        try {
            // Escape the text to prevent JSON injection
            String escapedText = text.replace("\n", "\\n").replace("\"", "\\\"");
            
            String jsonBody = String.format(
                "{\"sender\":{\"name\":\"%s\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"textContent\":\"%s\"}",
                fromName, fromEmail, to, subject, escapedText
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                log.warn("Failed to send email via Brevo. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new IllegalArgumentException("Failed to send email. Please check your Brevo configuration.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Email sending was interrupted.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Exception sending email via Brevo: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to send email due to a network error.");
        }
    }

    public void sendVerificationEmail(String to, String code) {
        log.info("REGISTRATION OTP FOR {}: {}", to, code);
        String subject = "StudentOS - Verify your Email";
        String text = "Welcome to StudentOS!\n\nYour email verification code is: " + code + "\n\nThis code will expire in 15 minutes.\n\nThanks,\nThe StudentOS Team";
        sendBrevoEmail(to, subject, text);
    }

    public void sendPasswordResetEmail(String to, String code) {
        log.info("PASSWORD RESET OTP FOR {}: {}", to, code);
        String subject = "StudentOS - Password Reset Request";
        String text = "Hello,\n\nYou requested a password reset for your StudentOS account.\n\nYour reset code is: " + code + "\n\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe StudentOS Team";
        sendBrevoEmail(to, subject, text);
    }
}

