package com.studentos.backend.service;

import com.studentos.backend.dto.ResourceRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ResourceService {

    private static final Logger logger = LoggerFactory.getLogger(ResourceService.class);

    private final ResourceRepository resourceRepository;
    private final AsyncService asyncService;
    private final ActivityService activityService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ResourceService(ResourceRepository resourceRepository,
                           AsyncService asyncService,
                           ActivityService activityService,
                           FileStorageService fileStorageService,
                           NotificationService notificationService) {
        this.resourceRepository = resourceRepository;
        this.asyncService = asyncService;
        this.activityService = activityService;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<Resource> getAllResources(String query) {
        logger.debug("Fetching all resources, query: {}", query);
        if (query != null && !query.trim().isEmpty()) {
            return resourceRepository.findByCourseCodeIgnoreCaseContainingOrTitleIgnoreCaseContaining(query, query);
        }
        return resourceRepository.findAllByOrderByUpvotesDesc();
    }

    @Transactional(readOnly = true)
    public Resource getResourceById(Long id) {
        logger.debug("Fetching resource by ID: {}", id);
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource " + id + " not found."));
    }

    public Resource uploadResource(ResourceRequest request, MultipartFile file, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        String fileUrl = request.getFileUrl();

        if (file != null && !file.isEmpty()) {
            logger.info("Storing uploaded file for resource: {}", request.getTitle());
            try {
                fileUrl = fileStorageService.storeFile(file);
            } catch (java.io.IOException e) {
                logger.error("Failed to store file", e);
                throw new RuntimeException("Failed to store file", e);
            }
        }

        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            logger.warn("No file or URL provided for resource: {}", request.getTitle());
            throw new IllegalArgumentException("File or File URL is required");
        }

        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .courseCode(request.getCourseCode())
                .courseTitle(request.getCourseTitle())
                .fileUrl(fileUrl)
                .type(request.getType())
                .uploader(currentUser)
                .upvotes(0)
                .anonymous(request.isAnonymous())
                .build();

        Resource savedResource = resourceRepository.save(resource);
        
        asyncService.processResourceBackground(savedResource.getTitle());

        activityService.logActivity(
            currentUser.getId(),
            savedResource.getTitle() + " uploaded",
            "You shared \"" + savedResource.getTitle() + "\" in Resource Sharing.",
            "resources",
            "success"
        );

        logger.info("Successfully uploaded resource: {}", savedResource.getId());
        return savedResource;
    }

    public Resource updateResource(Long id, ResourceRequest request, MultipartFile file, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        logger.info("Updating resource ID: {}", id);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource " + id + " not found."));

        if (!resource.getUploader().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to update this resource");
        }

        String oldFileUrl = resource.getFileUrl();
        
        resource.setTitle(request.getTitle());
        resource.setDescription(request.getDescription());
        resource.setCourseCode(request.getCourseCode());
        resource.setCourseTitle(request.getCourseTitle());
        resource.setType(request.getType());
        
        if (request.getFileUrl() != null && !request.getFileUrl().isEmpty()) {
            resource.setFileUrl(request.getFileUrl());
        }
        
        if (file != null && !file.isEmpty()) {
            logger.info("Storing new file for update of resource: {}", id);
            String newFileUrl;
            try {
                newFileUrl = fileStorageService.storeFile(file);
            } catch (java.io.IOException e) {
                logger.error("Failed to store new file", e);
                throw new RuntimeException("Failed to store new file", e);
            }
            resource.setFileUrl(newFileUrl);
            
            if (oldFileUrl != null && oldFileUrl.startsWith("/uploads/") && !oldFileUrl.equals(newFileUrl)) {
                fileStorageService.deleteFile(oldFileUrl);
            }
        }
        
        Resource updated = resourceRepository.save(resource);
        logger.info("Successfully updated resource: {}", id);
        return updated;
    }

    public void deleteResource(Long id, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        logger.info("Deleting resource ID: {}", id);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource " + id + " not found."));
        
        if (!resource.getUploader().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to delete this resource");
        }

        if (resource.getFileUrl() != null && resource.getFileUrl().startsWith("/uploads/")) {
            fileStorageService.deleteFile(resource.getFileUrl());
        }
        resourceRepository.delete(resource);
        logger.info("Successfully deleted resource: {}", id);
    }

    public Resource upvoteResource(Long id) {
        logger.info("Upvoting resource ID: {}", id);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource " + id + " not found."));
        resource.setUpvotes(resource.getUpvotes() + 1);
        return resourceRepository.save(resource);
    }
}
