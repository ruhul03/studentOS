package com.studentos.backend.service;

import com.studentos.backend.model.Activity;
import com.studentos.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public void logActivity(Long userId, String title, String description, String type, String status) {
        try {
            Activity activity = Activity.builder()
                    .userId(userId)
                    .title(title)
                    .description(description)
                    .type(type)
                    .status(status)
                    .build();
            activityRepository.save(activity);
        } catch (Exception e) {
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }
}
