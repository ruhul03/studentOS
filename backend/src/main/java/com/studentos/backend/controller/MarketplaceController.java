package com.studentos.backend.controller;

import com.studentos.backend.dto.MarketplaceRequest;
import jakarta.validation.Valid;
import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MarketplaceItemRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/marketplace")
@SuppressWarnings("null")
public class MarketplaceController {

    private final MarketplaceItemRepository itemRepository;
    private final ActivityService activityService;

    public MarketplaceController(MarketplaceItemRepository itemRepository, 
                                 ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.activityService = activityService;
    }

    @GetMapping
    public List<MarketplaceItem> getAvailableItems(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return itemRepository.findByCategoryIgnoreCaseAndSoldFalseOrderByListedAtDesc(category);
        }
        return itemRepository.findBySoldFalseOrderByListedAtDesc();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MarketplaceItem> createListing(@Valid @RequestBody MarketplaceRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        MarketplaceItem item = MarketplaceItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .condition(request.getCondition())
                .category(request.getCategory())
                .contactInfo(request.getContactInfo())
                .photosJson(request.getPhotosJson())
                .seller(currentUser)
                .sold(false)
                .build();

        MarketplaceItem savedItem = itemRepository.save(item);

        // Log Activity
        activityService.logActivity(
            currentUser.getId(),
            "Item Listed",
            "You listed \"" + savedItem.getTitle() + "\" for sale in Marketplace.",
            "market",
            "success"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MarketplaceItem> updateItem(@PathVariable Long id, @Valid @RequestBody MarketplaceRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        MarketplaceItem item = itemOpt.get();
        // Check ownership or Admin role
        if (!item.getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setCondition(request.getCondition());
        item.setCategory(request.getCategory());
        item.setContactInfo(request.getContactInfo());
        item.setPhotosJson(request.getPhotosJson());

        return ResponseEntity.ok(itemRepository.save(item));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        // Check ownership or Admin role
        if (!itemOpt.get().getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/sold")
    @Transactional
    public ResponseEntity<MarketplaceItem> markAsSold(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            MarketplaceItem item = itemOpt.get();
            // Check ownership
            if (!item.getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            item.setSold(true);
            MarketplaceItem soldItem = itemRepository.save(item);

            activityService.logActivity(
                soldItem.getSeller().getId(),
                "Item Sold!",
                "Great news! Your \"" + soldItem.getTitle() + "\" has been sold.",
                "market",
                "info"
            );

            return ResponseEntity.ok(soldItem);
        }
        return ResponseEntity.notFound().build();
    }
}
