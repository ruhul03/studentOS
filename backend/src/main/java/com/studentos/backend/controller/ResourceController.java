package com.studentos.backend.controller;

import com.studentos.backend.dto.ResourceRequest;
import jakarta.validation.Valid;
import com.studentos.backend.model.Resource;
import com.studentos.backend.model.User;
import com.studentos.backend.service.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@SuppressWarnings("null")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(resourceService.getAllResources(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Resource> uploadResource(
            @Valid @RequestPart("resource") ResourceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        Resource savedResource = resourceService.uploadResource(request, file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id, 
            @Valid @RequestPart("resource") ResourceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        Resource updated = resourceService.updateResource(id, request, file, currentUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResource(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        resourceService.deleteResource(id, currentUser);
        return ResponseEntity.ok("Resource deleted successfully.");
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Resource> upvoteResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.upvoteResource(id));
    }
}

