package com.studentos.backend.controller;

import com.studentos.backend.model.CampusService;
import com.studentos.backend.repository.CampusServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class CampusServiceController {

    private final CampusServiceRepository serviceRepository;

    public CampusServiceController(CampusServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<CampusService> getAllServices(@RequestParam(required = false) String category) {
        List<CampusService> services;
        if (category != null && !category.isEmpty()) {
            services = serviceRepository.findByCategoryIgnoreCase(category);
        } else {
            services = serviceRepository.findAll();
        }

        // Dynamically update status based on current time
        return services.stream().map(this::updateDynamicStatus).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CampusService> createService(@RequestBody CampusServiceRequest request) {
        CampusService service = CampusService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .operatingHours(request.getOperatingHours())
                .contactInfo(request.getContactInfo())
                .lastModifiedBy(request.getAdminName())
                .lastModifiedAt(java.time.LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceRepository.save(service));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CampusService> updateService(@PathVariable Long id, @RequestBody CampusServiceRequest request) {
        return serviceRepository.findById(id)
                .map(service -> {
                    service.setName(request.getName());
                    service.setDescription(request.getDescription());
                    service.setCategory(request.getCategory());
                    service.setLocation(request.getLocation());
                    service.setOperatingHours(request.getOperatingHours());
                    service.setContactInfo(request.getContactInfo());
                    service.setLastModifiedBy(request.getAdminName());
                    service.setLastModifiedAt(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(serviceRepository.save(service));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (serviceRepository.existsById(id)) {
            serviceRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private CampusService updateDynamicStatus(CampusService service) {
        try {
            String hours = service.getOperatingHours(); // e.g., "08:00 AM - 05:00 PM"
            if (hours == null || !hours.contains("-")) {
                service.setStatus("Unknown");
                return service;
            }

            String[] parts = hours.split("-");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            LocalTime start = LocalTime.parse(parts[0].trim().toUpperCase(), formatter);
            LocalTime end = LocalTime.parse(parts[1].trim().toUpperCase(), formatter);
            LocalTime now = LocalTime.now();

            if (now.isAfter(start) && now.isBefore(end)) {
                service.setStatus("Open");
            } else {
                service.setStatus("Closed");
            }
        } catch (Exception e) {
            service.setStatus("Closed"); // Default to closed on parse error
        }
        return service;
    }
}

class CampusServiceRequest {
    private String name;
    private String description;
    private String category;
    private String location;
    private String operatingHours;
    private String contactInfo;
    private String adminName;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
}
