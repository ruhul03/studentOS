package com.studentos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long totalCourses;
    private long pendingTasks;
    private long sharedResources;
    private long soldItems;
    private long completedTasks;
}
