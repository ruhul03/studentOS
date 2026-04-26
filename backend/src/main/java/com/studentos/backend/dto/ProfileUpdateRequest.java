package com.studentos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 500, message = "Bio too long")
    private String bio;

    private String profilePicture;

    @Size(max = 100, message = "Department name too long")
    private String department;

    @Size(max = 50, message = "Batch name too long")
    private String batch;

    @Size(max = 20, message = "Student ID too long")
    private String studentId;

    private String dateOfBirth;

    @Size(max = 20, message = "Phone number too long")
    private String phoneNumber;
}
