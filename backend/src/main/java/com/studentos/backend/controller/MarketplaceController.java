package com.studentos.backend.controller;

import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MarketplaceItemRepository;
import com.studentos.backend.repository.UserRepository;
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

    public MarketplaceController(MarketplaceItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
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

        return ResponseEntity.status(HttpStatus.CREATED).body(itemRepository.save(item));
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<MarketplaceItem> markAsSold(@PathVariable Long id) {
        Optional<MarketplaceItem> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            MarketplaceItem item = itemOpt.get();
            item.setSold(true);
            return ResponseEntity.ok(itemRepository.save(item));
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
