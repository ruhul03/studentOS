package com.studentos.backend.controller;

import com.studentos.backend.dto.MarketplaceRequest;
import jakarta.validation.Valid;
import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.service.MarketplaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@SuppressWarnings("null")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceItem>> getAvailableItems(@RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(marketplaceService.getAvailableItems(category));
    }

    @PostMapping
    public ResponseEntity<MarketplaceItem> createListing(@Valid @RequestBody MarketplaceRequest request, @AuthenticationPrincipal User currentUser) {
        MarketplaceItem savedItem = marketplaceService.createListing(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceItem> updateItem(@PathVariable("id") Long id, @Valid @RequestBody MarketplaceRequest request, @AuthenticationPrincipal User currentUser) {
        MarketplaceItem updatedItem = marketplaceService.updateItem(id, request, currentUser);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable("id") Long id, @AuthenticationPrincipal User currentUser) {
        marketplaceService.deleteItem(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<MarketplaceItem> markAsSold(@PathVariable("id") Long id, @AuthenticationPrincipal User currentUser) {
        MarketplaceItem soldItem = marketplaceService.markAsSold(id, currentUser);
        return ResponseEntity.ok(soldItem);
    }
}

