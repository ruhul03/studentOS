package com.studentos.backend.controller;

import com.studentos.backend.model.CampusService;
import com.studentos.backend.repository.CampusServiceRepository;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;

import java.util.List;

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
        if (category != null && !category.isEmpty()) {
            return serviceRepository.findByCategoryIgnoreCase(category);
        }
        return serviceRepository.findAll();
    }

    // Initialize some dummy data for the demo
    @PostConstruct
    public void initDummyData() {
        if (serviceRepository.count() == 0) {
            serviceRepository.save(CampusService.builder()
                    .name("Main Library")
                    .description("Central study space with books and printing.")
                    .category("Library")
                    .location("Building A, Floors 1-3")
                    .operatingHours("8:00 AM - 10:00 PM")
                    .contactInfo("lib@university.edu")
                    .status("Open")
                    .build());
                    
            serviceRepository.save(CampusService.builder()
                    .name("Medical Center")
                    .description("First aid, checkups, and basic student care.")
                    .category("Medical")
                    .location("Building C, Ground Floor")
                    .operatingHours("9:00 AM - 5:00 PM")
                    .contactInfo("Emergency: 911")
                    .status("Open")
                    .build());
                    
            serviceRepository.save(CampusService.builder()
                    .name("Student Cafeteria")
                    .description("Hot meals, snacks, and coffee.")
                    .category("Food")
                    .location("Student Union Building")
                    .operatingHours("7:30 AM - 9:00 PM")
                    .contactInfo("")
                    .status("Open")
                    .build());

            serviceRepository.save(CampusService.builder()
                    .name("Campus Shuttle")
                    .description("Bus connecting North and South campuses.")
                    .category("Transport")
                    .location("Main Gate Bus Stop")
                    .operatingHours("Every 15 mins (7 AM - 6 PM)")
                    .contactInfo("")
                    .status("Running")
                    .build());
        }
    }
}
