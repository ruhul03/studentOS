package com.studentos.backend.service;

import com.studentos.backend.dto.CampusEventRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.CampusEvent;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.CampusEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class CampusEventService {

    private final CampusEventRepository campusEventRepository;

    public CampusEventService(CampusEventRepository campusEventRepository) {
        this.campusEventRepository = campusEventRepository;
    }

    public List<CampusEvent> getAllEvents() {
        return campusEventRepository.findAllByOrderByEventDateAsc();
    }

    public CampusEvent createEvent(CampusEventRequest request) {
        CampusEvent event = CampusEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .eventDate(LocalDateTime.parse(request.getEventDate()))
                .organizer(request.getOrganizer())
                .uploaderId(request.getUploaderId())
                .build();

        return campusEventRepository.save(event);
    }

    public CampusEvent updateEvent(Long id, CampusEventRequest request, User user) {
        CampusEvent event = campusEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));

        if (user == null || (!"ADMIN".equals(user.getRole()) && !user.getId().equals(event.getUploaderId()))) {
            throw new UnauthorizedActionException("You don't have permission to update this event.");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(LocalDateTime.parse(request.getEventDate()));
        event.setOrganizer(request.getOrganizer());
        
        return campusEventRepository.save(event);
    }

    public void deleteEvent(Long id, User user) {
        CampusEvent event = campusEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));

        if (user == null || (!"ADMIN".equals(user.getRole()) && !user.getId().equals(event.getUploaderId()))) {
            throw new UnauthorizedActionException("You don't have permission to delete this event.");
        }

        campusEventRepository.delete(event);
    }
}
