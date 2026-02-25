package com.example.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String skuCode;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private Double originalPrice;

    @Column(length = 1000)
    private String imageUrl;

    private String category;
    private String brand;
    private Double rating;
    private Integer reviewCount;
    private Integer quantity;
}
