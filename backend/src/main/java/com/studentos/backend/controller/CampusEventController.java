package com.studentos.backend.controller;

import com.studentos.backend.dto.CampusEventRequest;
import com.studentos.backend.model.CampusEvent;
import com.studentos.backend.repository.CampusEventRepository;
import jakarta.validation.Valid;
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
    public ResponseEntity<CampusEvent> createEvent(@Valid @RequestBody CampusEventRequest request) {
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
            @Valid @RequestBody CampusEventRequest request,
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
