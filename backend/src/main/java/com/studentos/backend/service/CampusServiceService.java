package com.studentos.backend.service;

import com.studentos.backend.dto.CampusServiceRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.model.CampusService;
import com.studentos.backend.repository.CampusServiceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class CampusServiceService {

    private final CampusServiceRepository serviceRepository;

    public CampusServiceService(CampusServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public List<CampusService> getAllServices(String category) {
        List<CampusService> services;
        if (category != null && !category.isEmpty()) {
            services = serviceRepository.findByCategoryIgnoreCase(category);
        } else {
            services = serviceRepository.findAll();
        }

        return services.stream().map(this::updateDynamicStatus).collect(Collectors.toList());
    }

    public CampusService createService(CampusServiceRequest request) {
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
        
        return serviceRepository.save(service);
    }

    public CampusService updateService(Long id, CampusServiceRequest request) {
        CampusService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus Service not found with ID: " + id));

        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setLocation(request.getLocation());
        service.setOperatingHours(request.getOperatingHours());
        service.setContactInfo(request.getContactInfo());
        service.setLastModifiedBy(request.getAdminName());
        service.setLastModifiedAt(java.time.LocalDateTime.now());
        
        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campus Service not found with ID: " + id);
        }
        serviceRepository.deleteById(id);
    }

    private CampusService updateDynamicStatus(CampusService service) {
        try {
            String hours = service.getOperatingHours();
            if (hours == null || !hours.contains("-")) {
                service.setStatus("Unknown");
                return service;
            }

            String[] parts = hours.split("-");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            LocalTime start = LocalTime.parse(parts[0].trim().toUpperCase(), formatter);
            LocalTime end = LocalTime.parse(parts[1].trim().toUpperCase(), formatter);
            LocalTime now = LocalTime.now(ZoneId.of("Asia/Dhaka"));

            if (now.isAfter(start) && now.isBefore(end)) {
                service.setStatus("Open");
            } else {
                service.setStatus("Closed");
            }
        } catch (Exception e) {
            service.setStatus("Closed");
        }
        return service;
    }
}
