package com.studentos.backend.service;

import com.studentos.backend.dto.LostFoundRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.LostFoundItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

@Service
@SuppressWarnings("null")
public class LostFoundService {

    private final LostFoundItemRepository itemRepository;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    public LostFoundService(LostFoundItemRepository itemRepository, ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.activityService = activityService;
        this.objectMapper = new ObjectMapper();
    }

    public List<LostFoundItem> getActiveItems(String type) {
        if (type != null && !type.isEmpty()) {
            return itemRepository.findByTypeIgnoreCaseAndResolvedFalseOrderByReportedAtDesc(type);
        }
        return itemRepository.findByResolvedFalseOrderByReportedAtDesc();
    }

    public LostFoundItem reportItem(LostFoundRequest request, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("User must be authenticated to report an item.");
        }

        String photosJson = "[]";
        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            try {
                photosJson = objectMapper.writeValueAsString(request.getPhotos());
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }

        LostFoundItem item = LostFoundItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .contactInfo(request.getContactInfo())
                .reporter(currentUser)
                .resolved(false)
                .photosJson(photosJson)
                .build();

        LostFoundItem savedItem = itemRepository.save(item);

        activityService.logActivity(
            currentUser.getId(),
            "Item Reported: " + savedItem.getType(),
            "You reported a " + savedItem.getType().toLowerCase() + " item: \"" + savedItem.getTitle() + "\".",
            "lostfound",
            "info"
        );

        return savedItem;
    }

    public LostFoundItem updateItem(Long id, LostFoundRequest request, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("User must be authenticated to update an item.");
        }

        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to update this item.");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(request.getType());
        item.setLocation(request.getLocation());
        item.setContactInfo(request.getContactInfo());

        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            try {
                item.setPhotosJson(objectMapper.writeValueAsString(request.getPhotos()));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        } else {
            item.setPhotosJson("[]");
        }

        return itemRepository.save(item);
    }

    public void deleteItem(Long id, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("User must be authenticated to delete an item.");
        }

        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to delete this item.");
        }

        itemRepository.deleteById(id);
    }

    public LostFoundItem resolveItem(Long id, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("User must be authenticated to resolve an item.");
        }

        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (!item.getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You don't have permission to resolve this item.");
        }

        item.setResolved(true);
        return itemRepository.save(item);
    }
}
