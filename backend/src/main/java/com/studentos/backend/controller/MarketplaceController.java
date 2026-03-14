package com.studentos.backend.controller;

import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MarketplaceItemRepository;
import com.studentos.backend.repository.UserRepository;
import com.studentos.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<MarketplaceItem> createListing(@RequestBody MarketplaceRequest request) {
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
    public ResponseEntity<MarketplaceItem> updateItem(@PathVariable Long id, @RequestBody MarketplaceRequest request) {
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

        return ResponseEntity.ok(itemRepository.save(item));
    }

    @DeleteMapping("/{id}")
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

class MarketplaceRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String condition;
    private String category;
    private String contactInfo;
    private Long sellerId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
}
