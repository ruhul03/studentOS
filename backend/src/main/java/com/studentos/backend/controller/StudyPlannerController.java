package com.studentos.backend.controller;

import com.studentos.backend.dto.StudyTaskRequest;
import com.studentos.backend.model.StudyTask;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.StudyTaskRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/planner")
public class StudyPlannerController {

    private final StudyTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public StudyPlannerController(StudyTaskRepository taskRepository, 
                                  UserRepository userRepository,
                                  ActivityService activityService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyTask>> getUserTasks(@PathVariable Long userId, @RequestParam(required = false) Boolean completed, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(userId) && !"ADMIN".equals(currentUser.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (completed != null) {
            return ResponseEntity.ok(taskRepository.findByUserIdAndCompletedOrderByDueDateAsc(userId, completed));
        }
        return ResponseEntity.ok(taskRepository.findByUserIdOrderByDueDateAsc(userId));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<StudyTask> createTask(@Valid @RequestBody StudyTaskRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        StudyTask task = StudyTask.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .courseCode(request.getCourseCode())
                .type(request.getType())
                .dueDate(request.getDueDate())
                .completed(false)
                .user(currentUser)
                .build();

        StudyTask savedTask = taskRepository.save(task);

        // Log Activity
        activityService.logActivity(
            currentUser.getId(),
            "New Task: " + savedTask.getTitle(),
            "You added a new " + savedTask.getType() + " task for " + savedTask.getCourseCode() + ".",
            "planner",
            "info"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PutMapping("/{taskId}/toggle")
    @Transactional
    public ResponseEntity<StudyTask> toggleTaskCompletion(@PathVariable Long taskId, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<StudyTask> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            StudyTask task = taskOpt.get();
            // Ownership check or Admin role
            if (!task.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            task.setCompleted(!task.isCompleted());
            StudyTask updatedTask = taskRepository.save(task);

            if (updatedTask.isCompleted()) {
                activityService.logActivity(
                    updatedTask.getUser().getId(),
                    "Task Completed!",
                    "You finished the \"" + updatedTask.getTitle() + "\" task.",
                    "planner",
                    "success"
                );
            }

            return ResponseEntity.ok(updatedTask);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{taskId}")
    @Transactional
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<StudyTask> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            StudyTask task = taskOpt.get();
            // Ownership check or Admin role
            if (!task.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            taskRepository.delete(task);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
