package com.sg.gamestopbackend.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.dto.UserDto;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.sg.gamestopbackend.repository.CartItemRepository cartItemRepository;
    private final com.sg.gamestopbackend.repository.OrderRepository orderRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           com.sg.gamestopbackend.repository.CartItemRepository cartItemRepository,
                           com.sg.gamestopbackend.repository.OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public UserDto registerUser(UserDto userDto) {

        User user = new User();

        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());

        // Encrypt the password before saving
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        user.setRole(userDto.getRole());

        User savedUser = userRepository.save(user);

        UserDto response = new UserDto();

        response.setUserId(savedUser.getUserId());
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());

        // Never return the password
        response.setPassword(null);

        response.setRole(savedUser.getRole());

        return response;
    }

    @Override
    public UserDto getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.sg.gamestopbackend.exception.ResourceNotFoundException("User not found with id: " + userId));
        return mapToDto(user);
    }

    @Override
    public java.util.List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserDto updateUserRole(Integer userId, String newRole, String requestingUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.sg.gamestopbackend.exception.ResourceNotFoundException("User not found with id: " + userId));

        String normalizedRole = newRole != null ? newRole.trim().toUpperCase() : "ROLE_USER";
        if (!normalizedRole.startsWith("ROLE_")) {
            normalizedRole = "ROLE_" + normalizedRole;
        }

        boolean isTargetAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");
        boolean isNewAdmin = normalizedRole.contains("ADMIN");

        if (isTargetAdmin && !isNewAdmin) {
            long adminCount = userRepository.countByRoleContainingIgnoreCase("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot demote the last remaining administrator account.");
            }
        }

        user.setRole(normalizedRole);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Integer userId, String requestingUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.sg.gamestopbackend.exception.ResourceNotFoundException("User not found with id: " + userId));

        if (requestingUserEmail != null && user.getEmail().equalsIgnoreCase(requestingUserEmail.trim())) {
            throw new IllegalArgumentException("You cannot delete your currently logged-in administrator account.");
        }

        boolean isTargetAdmin = user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN");
        if (isTargetAdmin) {
            long adminCount = userRepository.countByRoleContainingIgnoreCase("ADMIN");
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot delete the last remaining administrator account.");
            }
        }

        // Clean up child cart items and orders to prevent foreign key constraint violations
        cartItemRepository.deleteByUser_UserId(userId);
        
        java.util.List<com.sg.gamestopbackend.entity.Order> userOrders = orderRepository.findByUser_UserId(userId);
        if (userOrders != null && !userOrders.isEmpty()) {
            orderRepository.deleteAll(userOrders);
        }

        userRepository.delete(user);
    }

    @Override
    public UserDto getProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new com.sg.gamestopbackend.exception.ResourceNotFoundException("User not found with email: " + userEmail));
        return mapToDto(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public UserDto updateProfile(String userEmail, com.sg.gamestopbackend.dto.ProfileUpdateRequestDto request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new com.sg.gamestopbackend.exception.ResourceNotFoundException("User not found with email: " + userEmail));

        // 1. Update username if provided
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new IllegalArgumentException("Username '" + newUsername + "' is already taken.");
                }
                user.setUsername(newUsername);
            }
        }

        // 2. Update password if provided
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            String newPass = request.getNewPassword().trim();
            if (newPass.length() < 6) {
                throw new IllegalArgumentException("New password must be at least 6 characters long.");
            }

            if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
                throw new IllegalArgumentException("Current password is required to change password.");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password entered is incorrect.");
            }

            user.setPassword(passwordEncoder.encode(newPass));
        }

        user.setUpdatedAt(java.time.LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPassword(null);
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}