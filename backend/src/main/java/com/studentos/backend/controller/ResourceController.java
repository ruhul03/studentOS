package com.studentos.backend.controller;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ResourceRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import com.studentos.backend.service.AsyncService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    private final ActivityService activityService;

    public ResourceController(ResourceRepository resourceRepository, 
                              UserRepository userRepository, 
                              AsyncService asyncService,
                              ActivityService activityService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.asyncService = asyncService;
        this.activityService = activityService;
    }

    @GetMapping
    public List<Resource> getAllResources(@RequestParam(required = false) String query) {
        System.out.println("DEBUG: Handled GET /api/resources (List)");
        if (query != null && !query.trim().isEmpty()) {
            return resourceRepository.findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(query, query);
        }
        return resourceRepository.findAllByOrderByUpvotesDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable String id) {
        System.out.println("DEBUG: Handled GET /api/resources/" + id);
        try {
            Long longId = Long.parseLong(id);
            Optional<Resource> resourceOpt = resourceRepository.findById(longId);
            if (resourceOpt.isPresent()) {
                return ResponseEntity.ok(resourceOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Diagnostic: Resource " + id + " not found in DB.");
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Diagnostic: ID " + id + " is not a valid number.");
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Resource> uploadResource(
            @RequestPart("resource") String resourceJson,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ResourceRequest request = mapper.readValue(resourceJson, ResourceRequest.class);
            
            Optional<User> uploaderOpt = userRepository.findById(request.getUploaderId());
            if (uploaderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            String fileUrl = request.getFileUrl();

            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                java.nio.file.Path path = java.nio.file.Paths.get("uploads", fileName);
                java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                // Build the URL for the file
                fileUrl = "/uploads/" + fileName;
            }

            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Resource resource = Resource.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .courseCode(request.getCourseCode())
                    .courseTitle(request.getCourseTitle())
                    .fileUrl(fileUrl)
                    .type(request.getType())
                    .uploader(uploaderOpt.get())
                    .upvotes(0)
                    .build();

            Resource savedResource = resourceRepository.save(resource);
            
            // Trigger background processing (Multithreading)
            asyncService.processResourceBackground(savedResource.getTitle());

            // Log Activity
            activityService.logActivity(
                request.getUploaderId(),
                savedResource.getTitle() + " uploaded",
                "You shared \"" + savedResource.getTitle() + "\" in Resource Sharing.",
                "resources",
                "success"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT, consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateResource(
            @PathVariable String id, 
            @RequestPart("resource") String resourceJson,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        
        System.out.println("DEBUG: Handled PUT /api/resources/" + id);
        try {
            Long longId = Long.parseLong(id);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ResourceRequest request = mapper.readValue(resourceJson, ResourceRequest.class);
            
            Optional<Resource> resourceOpt = resourceRepository.findById(longId);
            if (resourceOpt.isPresent()) {
                Resource resource = resourceOpt.get();
                resource.setTitle(request.getTitle());
                resource.setDescription(request.getDescription());
                resource.setCourseCode(request.getCourseCode());
                resource.setCourseTitle(request.getCourseTitle());
                resource.setType(request.getType());
                
                if (file != null && !file.isEmpty()) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    java.nio.file.Path path = java.nio.file.Paths.get("uploads", fileName);
                    java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    resource.setFileUrl("/uploads/" + fileName);
                }
                
                Resource updated = resourceRepository.save(resource);
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: ResourceID " + id + " not found in DB.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteResource(@PathVariable String id, @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        System.out.println("DEBUG: Handled DELETE /api/resources/" + id);
        try {
            Long longId = Long.parseLong(id);
            if (resourceRepository.existsById(longId)) {
                resourceRepository.deleteById(longId);
                return ResponseEntity.ok("Resource deleted successfully.");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: ResourceID " + id + " not found in DB.");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Error: ID " + id + " is not a valid number.");
        }
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Resource> upvoteResource(@PathVariable Long id) {
        System.out.println("Upvoting resource ID: " + id);
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            resource.setUpvotes(resource.getUpvotes() + 1);
            return ResponseEntity.ok(resourceRepository.save(resource));
        }
        return ResponseEntity.notFound().build();
    }

    public static class ResourceRequest {
        private String title;
        private String description;
        private String courseCode;
        private String courseTitle;
        private String fileUrl;
        private String type;
        private Long uploaderId;

        public ResourceRequest() {}
        public ResourceRequest(String title, String description, String courseCode, String courseTitle, String fileUrl, String type, Long uploaderId) {
            this.title = title; this.description = description; this.courseCode = courseCode; this.courseTitle = courseTitle; this.fileUrl = fileUrl; this.type = type; this.uploaderId = uploaderId;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getUploaderId() { return uploaderId; }
        public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
    }
}
