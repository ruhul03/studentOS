package com.studentos.backend.controller;

import com.studentos.backend.dto.LostFoundRequest;
import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.LostFoundItemRepository;
import com.studentos.backend.service.ActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lostfound")
@SuppressWarnings("null")
public class LostFoundController {
    private final LostFoundItemRepository itemRepository;
    private final ActivityService activityService;

    public LostFoundController(LostFoundItemRepository itemRepository, 
                               ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.activityService = activityService;
    }

    @GetMapping
    public List<LostFoundItem> getActiveItems(@RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return itemRepository.findByTypeIgnoreCaseAndResolvedFalseOrderByReportedAtDesc(type);
        }
        return itemRepository.findByResolvedFalseOrderByReportedAtDesc();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<LostFoundItem> reportItem(@Valid @RequestBody LostFoundRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        LostFoundItem item = LostFoundItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .contactInfo(request.getContactInfo())
                .reporter(currentUser)
                .resolved(false)
                .build();

        LostFoundItem savedItem = itemRepository.save(item);

        // Log Activity
        activityService.logActivity(
            currentUser.getId(),
            "Item Reported: " + savedItem.getType(),
            "You reported a " + savedItem.getType().toLowerCase() + " item: \"" + savedItem.getTitle() + "\".",
            "lostfound",
            "info"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<LostFoundItem> updateItem(@PathVariable Long id, @Valid @RequestBody LostFoundRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        LostFoundItem item = itemOpt.get();
        // Ownership check or Admin role
        if (!item.getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(request.getType());
        item.setLocation(request.getLocation());
        item.setContactInfo(request.getContactInfo());

        return ResponseEntity.ok(itemRepository.save(item));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        // Ownership check or Admin role
        if (!itemOpt.get().getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/resolve")
    @Transactional
    public ResponseEntity<LostFoundItem> resolveItem(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            LostFoundItem item = itemOpt.get();
            // Ownership check or Admin role
            if (!item.getReporter().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            item.setResolved(true);
            return ResponseEntity.ok(itemRepository.save(item));
        }
        return ResponseEntity.notFound().build();
    }
}
