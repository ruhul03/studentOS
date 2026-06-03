package com.studentos.backend.service;

import com.studentos.backend.dto.StudyTaskRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.StudyTask;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.StudyTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudyPlannerService {

    private final StudyTaskRepository taskRepository;
    private final ActivityService activityService;

    public StudyPlannerService(StudyTaskRepository taskRepository, ActivityService activityService) {
        this.taskRepository = taskRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<StudyTask> getUserTasks(Long userId, Boolean completed, User currentUser) {
        if (currentUser == null || (!currentUser.getId().equals(userId) && !"ADMIN".equals(currentUser.getRole()))) {
            throw new UnauthorizedActionException("You are not authorized to view these tasks");
        }

        if (completed != null) {
            return taskRepository.findByUserIdAndCompletedOrderByDueDateAsc(userId, completed);
        }
        return taskRepository.findByUserIdOrderByDueDateAsc(userId);
    }

    public StudyTask createTask(StudyTaskRequest request, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Authentication required");
        }

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

        return savedTask;
    }

    public StudyTask updateTask(Long taskId, StudyTaskRequest request, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Authentication required");
        }

        StudyTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to modify this task");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCourseCode(request.getCourseCode());
        task.setType(request.getType());
        task.setDueDate(request.getDueDate());

        StudyTask updatedTask = taskRepository.save(task);

        activityService.logActivity(
            currentUser.getId(),
            "Task Updated: " + updatedTask.getTitle(),
            "You updated the details for your " + updatedTask.getType() + " task.",
            "planner",
            "info"
        );

        return updatedTask;
    }

    public StudyTask toggleTaskCompletion(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Authentication required");
        }

        StudyTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to modify this task");
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

        return updatedTask;
    }

    public void deleteTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Authentication required");
        }

        StudyTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to delete this task");
        }

        taskRepository.delete(task);
    }
}
