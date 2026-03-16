package com.studentos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String username;
    private String email;
    private String bio;
    private String profilePicture;
    private String department;
    private String batch;
    private String studentId;
    private String dateOfBirth;
    private String phoneNumber;
}
