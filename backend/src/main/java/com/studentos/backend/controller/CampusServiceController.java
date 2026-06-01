package com.studentos.backend.controller;

import com.studentos.backend.dto.CampusServiceRequest;
import com.studentos.backend.model.CampusService;
import com.studentos.backend.service.CampusServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@SuppressWarnings("null")
public class CampusServiceController {

    private final CampusServiceService campusServiceService;

    public CampusServiceController(CampusServiceService campusServiceService) {
        this.campusServiceService = campusServiceService;
    }

    @GetMapping
    public ResponseEntity<List<CampusService>> getAllServices(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(campusServiceService.getAllServices(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusService> createService(@Valid @RequestBody CampusServiceRequest request) {
        CampusService savedService = campusServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampusService> updateService(@PathVariable Long id, @Valid @RequestBody CampusServiceRequest request) {
        CampusService updatedService = campusServiceService.updateService(id, request);
        return ResponseEntity.ok(updatedService);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        campusServiceService.deleteService(id);
        return ResponseEntity.ok().build();
    }
}
