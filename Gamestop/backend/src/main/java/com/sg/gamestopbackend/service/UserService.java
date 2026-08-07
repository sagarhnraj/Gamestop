package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.UserDto;

public interface UserService {

    UserDto registerUser(UserDto userDto);

    UserDto getUserById(Integer userId);

    java.util.List<UserDto> getAllUsers();

    UserDto updateUserRole(Integer userId, String newRole, String requestingUserEmail);

    void deleteUser(Integer userId, String requestingUserEmail);

    UserDto getProfile(String userEmail);

    UserDto updateProfile(String userEmail, com.sg.gamestopbackend.dto.ProfileUpdateRequestDto request);
}