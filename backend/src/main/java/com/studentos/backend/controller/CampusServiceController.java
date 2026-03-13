package com.studentos.backend.controller;

import com.studentos.backend.model.CampusService;
import com.studentos.backend.repository.CampusServiceRepository;
import org.springframework.web.bind.annotation.*;

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
}
