package com.studentos.backend.repository;

import com.studentos.backend.model.MarketplaceItem;
import com.studentos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    List<MarketplaceItem> findBySoldFalseOrderByListedAtDesc();
    List<MarketplaceItem> findByCategoryIgnoreCaseAndSoldFalseOrderByListedAtDesc(String category);
    long countBySellerAndSoldTrue(User seller);
    long countBySeller(User seller);
    List<MarketplaceItem> findAllBySeller(User seller);
    @org.springframework.transaction.annotation.Transactional
    void deleteBySeller(User seller);
}
