package com.example.controller;

import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/auth/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/auth/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        return authService.login(request.get("username"), request.get("password"));
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/count")
    public Map<String, Long> getUserCount() {
        return Map.of("totalUsers", userRepository.count());
    }

    @GetMapping("/users/analytics/customers")
    public Map<String, Long> getCustomerCount() {
        return Map.of("customerCount", userRepository.countByRole(User.Role.CUSTOMER));
    }

    @GetMapping("/users/analytics/active")
    public Map<String, Long> getActiveSessions() {
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        return Map.of("activeSessions", userRepository.countByLastActiveAtAfter(fifteenMinutesAgo));
    }
}
