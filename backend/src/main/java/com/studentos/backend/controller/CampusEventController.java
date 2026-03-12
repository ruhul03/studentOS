package com.studentos.backend.controller;

import com.studentos.backend.model.CampusEvent;
import com.studentos.backend.repository.CampusEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<CampusEvent> createEvent(@RequestBody CampusEventRequest request) {
        CampusEvent event = CampusEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .eventDate(LocalDateTime.parse(request.getEventDate()))
                .organizer(request.getOrganizer())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(campusEventRepository.save(event));
    }
}

class CampusEventRequest {
    private String title;
    private String description;
    private String location;
    private String eventDate;
    private String organizer;

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
}
