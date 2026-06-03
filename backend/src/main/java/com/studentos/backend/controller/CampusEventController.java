package com.studentos.backend.controller;

import com.studentos.backend.dto.CampusEventRequest;
import com.studentos.backend.model.CampusEvent;
import com.studentos.backend.model.User;
import com.studentos.backend.service.CampusEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@SuppressWarnings("null")
public class CampusEventController {

    private final CampusEventService campusEventService;

    public CampusEventController(CampusEventService campusEventService) {
        this.campusEventService = campusEventService;
    }

    @GetMapping
    public ResponseEntity<List<CampusEvent>> getAllEvents() {
        return ResponseEntity.ok(campusEventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<CampusEvent> createEvent(@Valid @RequestBody CampusEventRequest request) {
        CampusEvent event = campusEventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusEvent> updateEvent(
            @PathVariable("id") Long id, 
            @Valid @RequestBody CampusEventRequest request,
            @AuthenticationPrincipal User user) {
        CampusEvent updatedEvent = campusEventService.updateEvent(id, request, user);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User user) {
        campusEventService.deleteEvent(id, user);
        return ResponseEntity.ok("Event deleted successfully.");
    }
}
