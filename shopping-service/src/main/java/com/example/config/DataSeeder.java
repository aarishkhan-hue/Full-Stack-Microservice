package com.example.config;

import com.example.model.Inventory;
import com.example.repository.InventoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner loadData(InventoryRepository inventoryRepository) {
        return args -> {
            if (inventoryRepository.count() == 0) {
                Inventory macbook = Inventory.builder()
                        .skuCode("MAC-PRO-M3")
                        .name("MacBook Pro 14\" M3 Max")
                        .description(
                                "Apple M3 Max chip with 14‑core CPU, 30‑core GPU, 36GB Unified Memory, 1TB SSD Storage. Liquid Retina XDR display.")
                        .price(2499.00)
                        .originalPrice(2799.00)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800")
                        .category("Laptops")
                        .brand("Apple")
                        .rating(4.9)
                        .reviewCount(1243)
                        .quantity(50)
                        .build();

                Inventory iphone = Inventory.builder()
                        .skuCode("IPHONE-15-PRO")
                        .name("iPhone 15 Pro Max 256GB")
                        .description(
                                "Titanium body, A17 Pro chip, 48MP Main camera, 5x Telephoto, Action button, USB-C. The ultimate Pro experience.")
                        .price(1199.00)
                        .originalPrice(1199.00)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800")
                        .category("Smartphones")
                        .brand("Apple")
                        .rating(4.8)
                        .reviewCount(5421)
                        .quantity(200)
                        .build();

                Inventory sony = Inventory.builder()
                        .skuCode("SONY-WH1000XM5")
                        .name("Sony WH-1000XM5 Noise Canceling Headphones")
                        .description(
                                "Industry Leading Noise Canceling with Auto NC Optimizer, 30 hours battery life, multipoint connection.")
                        .price(348.00)
                        .originalPrice(399.99)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800")
                        .category("Audio")
                        .brand("Sony")
                        .rating(4.7)
                        .reviewCount(8932)
                        .quantity(120)
                        .build();

                Inventory samsung = Inventory.builder()
                        .skuCode("SAM-S24-ULTRA")
                        .name("Samsung Galaxy S24 Ultra")
                        .description(
                                "Galaxy AI is here. 200MP camera, Snapdragon 8 Gen 3, Titanium exterior, built-in S Pen.")
                        .price(1299.99)
                        .originalPrice(1399.99)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800")
                        .category("Smartphones")
                        .brand("Samsung")
                        .rating(4.8)
                        .reviewCount(3210)
                        .quantity(85)
                        .build();

                Inventory monitor = Inventory.builder()
                        .skuCode("LG-ULTRAGEAR-OLED")
                        .name("LG UltraGear 45\" OLED Curved Gaming Monitor")
                        .description(
                                "45\" WQHD (3440 x 1440) 240Hz 0.03ms OLED Curved Gaming Monitor with G-SYNC Compatibility.")
                        .price(1499.00)
                        .originalPrice(1699.99)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800")
                        .category("Monitors")
                        .brand("LG")
                        .rating(4.6)
                        .reviewCount(842)
                        .quantity(25)
                        .build();

                Inventory keyboard = Inventory.builder()
                        .skuCode("KEYCHRON-Q1")
                        .name("Keychron Q1 Pro Wireless Custom Mechanical Keyboard")
                        .description(
                                "QMK/VIA wireless custom mechanical keyboard with a full CNC machined aluminum body.")
                        .price(199.00)
                        .originalPrice(219.00)
                        .imageUrl(
                                "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800")
                        .category("Accessories")
                        .brand("Keychron")
                        .rating(4.9)
                        .reviewCount(2154)
                        .quantity(300)
                        .build();

                inventoryRepository.saveAll(List.of(macbook, iphone, sony, samsung, monitor, keyboard));
            }
        };
    }
}
