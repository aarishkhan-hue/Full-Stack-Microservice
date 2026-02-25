package com.example.repository;

import com.example.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM Order o WHERE o.orderTime > :time")
    long sumQuantitySince(@Param("time") LocalDateTime time);
}
