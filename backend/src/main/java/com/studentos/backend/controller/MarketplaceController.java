package com.studentos.backend.controller;

import com.studentos.backend.dto.MarketplaceRequest;
import jakarta.validation.Valid;
import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MarketplaceItemRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MarketplaceItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public MarketplaceController(MarketplaceItemRepository itemRepository, 
                                 UserRepository userRepository,
                                 ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
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
    public ResponseEntity<MarketplaceItem> createListing(@Valid @RequestBody MarketplaceRequest request) {
        Optional<User> sellerOpt = userRepository.findById(request.getSellerId());
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        MarketplaceItem item = MarketplaceItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .condition(request.getCondition())
                .category(request.getCategory())
                .contactInfo(request.getContactInfo())
                .photosJson(request.getPhotosJson())
                .seller(sellerOpt.get())
                .sold(false)
                .build();

        MarketplaceItem savedItem = itemRepository.save(item);

        // Log Activity
        activityService.logActivity(
            request.getSellerId(),
            "Item Listed",
            "You listed \"" + savedItem.getTitle() + "\" for sale in Marketplace.",
            "market",
            "success"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MarketplaceItem> updateItem(@PathVariable Long id, @Valid @RequestBody MarketplaceRequest request) {
        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        MarketplaceItem item = itemOpt.get();
        if (!item.getSeller().getId().equals(request.getSellerId())) {
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
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @RequestParam Long userId) {
        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (!itemOpt.get().getSeller().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/sold")
    @Transactional
    public ResponseEntity<MarketplaceItem> markAsSold(@PathVariable Long id) {
        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            MarketplaceItem item = itemOpt.get();
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
