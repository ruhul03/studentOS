package com.studentos.backend.controller;

import com.studentos.backend.model.LostFoundItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.LostFoundItemRepository;
import com.studentos.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lostfound")
@CrossOrigin(origins = "*")
public class LostFoundController {

    private final LostFoundItemRepository itemRepository;
    private final UserRepository userRepository;

    public LostFoundController(LostFoundItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<LostFoundItem> getActiveItems(@RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return itemRepository.findByTypeIgnoreCaseAndResolvedFalseOrderByReportedAtDesc(type);
        }
        return itemRepository.findByResolvedFalseOrderByReportedAtDesc();
    }

    @PostMapping
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

        return ResponseEntity.status(HttpStatus.CREATED).body(itemRepository.save(item));
    }

    @PutMapping("/{id}/resolve")
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

class LostFoundRequest {
    private String title;
    private String description;
    private String type; // "Lost" or "Found"
    private String location;
    private String contactInfo;
    private Long reporterId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
}
