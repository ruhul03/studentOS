package com.studentos.backend.service;

import com.studentos.backend.dto.MarketplaceRequest;
import com.studentos.backend.exception.ResourceNotFoundException;
import com.studentos.backend.exception.UnauthorizedActionException;
import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import com.studentos.backend.repository.MarketplaceItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MarketplaceService {

    private final MarketplaceItemRepository itemRepository;
    private final ActivityService activityService;

    public MarketplaceService(MarketplaceItemRepository itemRepository, ActivityService activityService) {
        this.itemRepository = itemRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<MarketplaceItem> getAvailableItems(String category) {
        if (category != null && !category.isEmpty()) {
            return itemRepository.findByCategoryIgnoreCaseAndSoldFalseOrderByListedAtDesc(category);
        }
        return itemRepository.findBySoldFalseOrderByListedAtDesc();
    }

    public MarketplaceItem createListing(MarketplaceRequest request, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

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

        activityService.logActivity(
            currentUser.getId(),
            "Item Listed",
            "You listed \"" + savedItem.getTitle() + "\" for sale in Marketplace.",
            "market",
            "success"
        );

        return savedItem;
    }

    public MarketplaceItem updateItem(Long id, MarketplaceRequest request, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!item.getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to update this item");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setCondition(request.getCondition());
        item.setCategory(request.getCategory());
        item.setContactInfo(request.getContactInfo());
        item.setPhotosJson(request.getPhotosJson());

        return itemRepository.save(item);
    }

    public void deleteItem(Long id, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!item.getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to delete this item");
        }

        itemRepository.deleteById(id);
    }

    public MarketplaceItem markAsSold(Long id, User currentUser) {
        if (currentUser == null) throw new UnauthorizedActionException("Authentication required");

        MarketplaceItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!item.getSeller().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentUser.getRole())) {
            throw new UnauthorizedActionException("You do not have permission to modify this item");
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

        return soldItem;
    }
}
