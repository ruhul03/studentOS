package com.studentos.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "item_condition", nullable = false)
    private String condition; // "New", "Good", "Fair"

    @Column(nullable = false)
    private String category; // "Books", "Electronics", "Furniture"

    @Column(nullable = false)
    private String contactInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Builder.Default
    private boolean sold = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime listedAt;
}
