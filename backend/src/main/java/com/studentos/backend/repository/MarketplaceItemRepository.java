package com.studentos.backend.repository;

import com.studentos.backend.model.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    List<MarketplaceItem> findBySoldFalseOrderByListedAtDesc();
    List<MarketplaceItem> findByCategoryIgnoreCaseAndSoldFalseOrderByListedAtDesc(String category);
}
