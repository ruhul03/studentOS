package com.studentos.backend.controller;

import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ResourceRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import com.studentos.backend.service.AsyncService;
import com.studentos.backend.service.FileStorageService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
class ResourceRequest {
    private String title;
    private String description;
    private String courseCode;
    private String courseTitle;
    private String fileUrl;
    private String type;
    private Long uploaderId;
}

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AsyncService asyncService;
    private final ActivityService activityService;
    private final FileStorageService fileStorageService;

    public ResourceController(ResourceRepository resourceRepository, 
                              UserRepository userRepository, 
                              AsyncService asyncService,
                              ActivityService activityService,
                              FileStorageService fileStorageService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.asyncService = asyncService;
        this.activityService = activityService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<Resource> getAllResources(@RequestParam(required = false) String query) {
        logger.debug("Fetching all resources, query: {}", query);
        if (query != null && !query.trim().isEmpty()) {
            return resourceRepository.findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(query, query);
        }
        return resourceRepository.findAllByOrderByUpvotesDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        logger.debug("Fetching resource by ID: {}", id);
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            return ResponseEntity.ok(resourceOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource " + id + " not found.");
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @Transactional
    public ResponseEntity<Resource> uploadResource(
            @RequestPart("resource") ResourceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        try {
            // Comprehensive Validation
            if (request.getTitle() == null || request.getTitle().trim().isEmpty() ||
                request.getCourseCode() == null || request.getCourseCode().trim().isEmpty() ||
                request.getDescription() == null || request.getDescription().trim().isEmpty() ||
                request.getCourseTitle() == null || request.getCourseTitle().trim().isEmpty() ||
                request.getUploaderId() == null) {
                logger.warn("Invalid upload request: missing mandatory fields");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            Optional<User> uploaderOpt = userRepository.findById(request.getUploaderId());
            if (uploaderOpt.isEmpty()) {
                logger.error("Uploader ID {} not found", request.getUploaderId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            String fileUrl = request.getFileUrl();

            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                logger.info("Storing uploaded file for resource: {}", request.getTitle());
                fileUrl = fileStorageService.storeFile(file);
            }

            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                logger.warn("No file or URL provided for resource: {}", request.getTitle());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
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
            
            // Trigger background processing
            asyncService.processResourceBackground(savedResource.getTitle());

            // Log Activity
            activityService.logActivity(
                request.getUploaderId(),
                savedResource.getTitle() + " uploaded",
                "You shared \"" + savedResource.getTitle() + "\" in Resource Sharing.",
                "resources",
                "success"
            );

            logger.info("Successfully uploaded resource: {}", savedResource.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
        } catch (Exception e) {
            logger.error("Error uploading resource", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @Transactional
    public ResponseEntity<?> updateResource(
            @PathVariable Long id, 
            @RequestPart("resource") ResourceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        logger.info("Updating resource ID: {}", id);
        try {
            Optional<Resource> resourceOpt = resourceRepository.findById(id);
            if (resourceOpt.isPresent()) {
                Resource resource = resourceOpt.get();
                
                // Track old file for conditional deletion
                String oldFileUrl = resource.getFileUrl();
                
                resource.setTitle(request.getTitle());
                resource.setDescription(request.getDescription());
                resource.setCourseCode(request.getCourseCode());
                resource.setCourseTitle(request.getCourseTitle());
                resource.setType(request.getType());
                
                // Fix: Allow updating fileUrl (for external links) even if no new file is uploaded
                if (request.getFileUrl() != null && !request.getFileUrl().isEmpty()) {
                    resource.setFileUrl(request.getFileUrl());
                }
                
                if (file != null && !file.isEmpty()) {
                    logger.info("Storing new file for update of resource: {}", id);
                    String newFileUrl = fileStorageService.storeFile(file);
                    resource.setFileUrl(newFileUrl);
                    
                    // Cleanup old file only if it was a local storage file and is replaced
                    if (oldFileUrl != null && oldFileUrl.startsWith("/uploads/") && !oldFileUrl.equals(newFileUrl)) {
                        fileStorageService.deleteFile(oldFileUrl);
                    }
                }
                
                Resource updated = resourceRepository.save(resource);
                logger.info("Successfully updated resource: {}", id);
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource " + id + " not found.");
            }
        } catch (Exception e) {
            logger.error("Error updating resource ID: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        logger.info("Deleting resource ID: {}", id);
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            // Delete file from disk if it's a local upload
            if (resource.getFileUrl() != null && resource.getFileUrl().startsWith("/uploads/")) {
                fileStorageService.deleteFile(resource.getFileUrl());
            }
            resourceRepository.delete(resource);
            logger.info("Successfully deleted resource: {}", id);
            return ResponseEntity.ok("Resource deleted successfully.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource " + id + " not found.");
    }

    @PostMapping("/{id}/upvote")
    @Transactional
    public ResponseEntity<Resource> upvoteResource(@PathVariable Long id) {
        logger.info("Upvoting resource ID: {}", id);
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            resource.setUpvotes(resource.getUpvotes() + 1);
            return ResponseEntity.ok(resourceRepository.save(resource));
        }
        return ResponseEntity.notFound().build();
    }

}
