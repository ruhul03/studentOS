package com.studentos.backend.controller;

import com.studentos.backend.model.CampusEvent;
import com.studentos.backend.repository.CampusEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class CampusEventController {

    private final CampusEventRepository campusEventRepository;

    public CampusEventController(CampusEventRepository campusEventRepository) {
        this.campusEventRepository = campusEventRepository;
    }

    @GetMapping
    public List<CampusEvent> getAllEvents() {
        return campusEventRepository.findAllByOrderByEventDateAsc();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CampusEvent> createEvent(@RequestBody CampusEventRequest request) {
        CampusEvent event = CampusEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .eventDate(LocalDateTime.parse(request.getEventDate()))
                .organizer(request.getOrganizer())
                .uploaderId(request.getUploaderId())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(campusEventRepository.save(event));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CampusEvent> updateEvent(
            @PathVariable Long id, 
            @RequestBody CampusEventRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        
        return campusEventRepository.findById(id)
                .map(event -> {
                    // Authorization Check
                    if (!"ADMIN".equals(role) && (userId == null || !userId.equals(event.getUploaderId()))) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<CampusEvent>build();
                    }
                    
                    event.setTitle(request.getTitle());
                    event.setDescription(request.getDescription());
                    event.setLocation(request.getLocation());
                    event.setEventDate(LocalDateTime.parse(request.getEventDate()));
                    event.setOrganizer(request.getOrganizer());
                    return ResponseEntity.ok(campusEventRepository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        
        return campusEventRepository.findById(id)
                .map(event -> {
                    // Authorization Check
                    if (!"ADMIN".equals(role) && (userId == null || !userId.equals(event.getUploaderId()))) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    
                    campusEventRepository.delete(event);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

class CampusEventRequest {
    private String title;
    private String description;
    private String location;
    private String eventDate;
    private String organizer;
    private Long uploaderId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    
    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
}
