package com.studentos.backend.config;

import com.studentos.backend.model.*;
import com.studentos.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class GlobalDataInitializer {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            CampusEventRepository eventRepository,
            MarketplaceItemRepository marketRepository,
            CourseReviewRepository reviewRepository,
            ResourceRepository resourceRepository,
            StudyTaskRepository taskRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Users
            if (userRepository.count() == 0) {
                User student = userRepository.save(User.builder()
                        .name("Test Student")
                        .username("test_user")
                        .email("test@test.com")
                        .password(passwordEncoder.encode("password123"))
                        .role("STUDENT")
                        .isVerified(true)
                        .build());
                
                userRepository.save(User.builder()
                        .name("Admin User")
                        .username("admin")
                        .email("admin@studentos.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role("ADMIN")
                        .isVerified(true)
                        .build());

                // 2. Events
                if (eventRepository.count() == 0) {
                    eventRepository.save(CampusEvent.builder()
                            .title("UIU CSE Fest 2026")
                            .description("A celebration of student innovation and technology at United City.")
                            .location("UIU Auditorium, Madani Ave")
                            .eventDate(LocalDateTime.now().plusDays(5))
                            .organizer("UIU Computer Club")
                            .build());
                    
                    eventRepository.save(CampusEvent.builder()
                            .title("Career Fair @ Madani")
                            .description("Meet top recruiters at the UIU permanent campus.")
                            .location("Multipurpose Hall, United City")
                            .eventDate(LocalDateTime.now().plusDays(10))
                            .organizer("UIU Career Counseling Center")
                            .build());
                }

                // 3. Marketplace
                if (marketRepository.count() == 0) {
                    marketRepository.save(MarketplaceItem.builder()
                            .title("UIU Bus Pass - Summer 2026")
                            .description("Selling my transport pass for the upcoming trimester.")
                            .price(new java.math.BigDecimal("1500.00"))
                            .category("Other")
                            .condition("New")
                            .seller(student)
                            .contactInfo("student@uiu.ac.bd")
                            .build());
                }

                // 4. Course Reviews
                if (reviewRepository.count() == 0) {
                    reviewRepository.save(CourseReview.builder()
                            .courseCode("CSE 4165")
                            .courseName("Web Programming")
                            .professor("Dr. Sadiqur Rahman")
                            .qualityRating(5)
                            .difficultyRating(4)
                            .reviewText("Intense course but very rewarding. Madani Avenue labs are great for this!")
                            .reviewer(student)
                            .build());
                }

                // 5. Resources
                if (resourceRepository.count() == 0) {
                    resourceRepository.save(Resource.builder()
                            .title("Digital Logic Design Notes")
                            .description("Comprehensive notes for CSE 1325 midterm prep.")
                            .courseCode("CSE 1325")
                            .uploader(student)
                            .type("Notes")
                            .fileUrl("/demo/dld_notes.pdf")
                            .build());
                }
            }
        };
    }
}
