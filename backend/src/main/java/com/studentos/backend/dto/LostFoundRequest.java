package com.studentos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundRequest {
    private String title;
    private String description;
    private String type; // "Lost" or "Found"
    private String location;
    private String contactInfo;
    private Long reporterId;
}
