package com.studentos.backend.controller;

import com.studentos.backend.dto.StudyTaskRequest;
import com.studentos.backend.model.StudyTask;
import com.studentos.backend.model.User;
import com.studentos.backend.service.StudyPlannerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planner")
@SuppressWarnings("null")
public class StudyPlannerController {

    private final StudyPlannerService studyPlannerService;

    public StudyPlannerController(StudyPlannerService studyPlannerService) {
        this.studyPlannerService = studyPlannerService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyTask>> getUserTasks(@PathVariable("userId") Long userId, @RequestParam(value = "completed", required = false) Boolean completed, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(studyPlannerService.getUserTasks(userId, completed, currentUser));
    }

    @PostMapping
    public ResponseEntity<StudyTask> createTask(@Valid @RequestBody StudyTaskRequest request, @AuthenticationPrincipal User currentUser) {
        StudyTask savedTask = studyPlannerService.createTask(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PutMapping("/{taskId}/toggle")
    public ResponseEntity<StudyTask> toggleTaskCompletion(@PathVariable("taskId") Long taskId, @AuthenticationPrincipal User currentUser) {
        StudyTask updatedTask = studyPlannerService.toggleTaskCompletion(taskId, currentUser);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable("taskId") Long taskId, @AuthenticationPrincipal User currentUser) {
        studyPlannerService.deleteTask(taskId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
