package com.studentos.backend.controller;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ResourceRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.AsyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AsyncService asyncService;

    public ResourceController(ResourceRepository resourceRepository, UserRepository userRepository, AsyncService asyncService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.asyncService = asyncService;
    }

    @GetMapping
    public List<Resource> getAllResources(@RequestParam(required = false) String query) {
        if (query != null && !query.trim().isEmpty()) {
            return resourceRepository.findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(query, query);
        }
        return resourceRepository.findAllByOrderByUpvotesDesc();
    }

    @PostMapping
    public ResponseEntity<Resource> uploadResource(@RequestBody ResourceRequest request) {
        Optional<User> uploaderOpt = userRepository.findById(request.getUploaderId());
        
        if (uploaderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .courseCode(request.getCourseCode())
                .fileUrl(request.getFileUrl())
                .type(request.getType())
                .uploader(uploaderOpt.get())
                .upvotes(0)
                .build();

        Resource savedResource = resourceRepository.save(resource);
        
        // Trigger background processing (Multithreading)
        asyncService.processResourceBackground(savedResource.getTitle());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Resource> upvoteResource(@PathVariable Long id) {
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            resource.setUpvotes(resource.getUpvotes() + 1);
            return ResponseEntity.ok(resourceRepository.save(resource));
        }
        return ResponseEntity.notFound().build();
    }
}

class ResourceRequest {
    private String title;
    private String description;
    private String courseCode;
    private String fileUrl;
    private String type;
    private Long uploaderId;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
}
