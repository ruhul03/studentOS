package com.studentos.backend.controller;

import com.studentos.backend.dto.LostFoundRequest;
import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.LostFoundItemRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lostfound")
@CrossOrigin(origins = "*")
public class LostFoundController {

    private final LostFoundItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public LostFoundController(LostFoundItemRepository itemRepository, 
                               UserRepository userRepository,
                               ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
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
    public ResponseEntity<LostFoundItem> reportItem(@RequestBody LostFoundRequest request) {
        Optional<User> reporterOpt = userRepository.findById(request.getReporterId());
        if (reporterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        LostFoundItem item = LostFoundItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .contactInfo(request.getContactInfo())
                .reporter(reporterOpt.get())
                .resolved(false)
                .build();

        LostFoundItem savedItem = itemRepository.save(item);

        // Log Activity
        activityService.logActivity(
            request.getReporterId(),
            "Item Reported: " + savedItem.getType(),
            "You reported a " + savedItem.getType().toLowerCase() + " item: \"" + savedItem.getTitle() + "\".",
            "lostfound",
            "info"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<LostFoundItem> updateItem(@PathVariable Long id, @RequestBody LostFoundRequest request) {
        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        LostFoundItem item = itemOpt.get();
        // Simple ownership check (in real app, use SecurityContext)
        if (!item.getReporter().getId().equals(request.getReporterId())) {
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
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @RequestParam Long userId) {
        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (!itemOpt.get().getReporter().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/resolve")
    @Transactional
    public ResponseEntity<LostFoundItem> resolveItem(@PathVariable Long id) {
        Optional<LostFoundItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            LostFoundItem item = itemOpt.get();
            item.setResolved(true);
            return ResponseEntity.ok(itemRepository.save(item));
        }
        return ResponseEntity.notFound().build();
    }
}
