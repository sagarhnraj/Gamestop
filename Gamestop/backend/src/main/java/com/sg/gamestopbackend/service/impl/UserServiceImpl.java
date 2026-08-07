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

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        return null;
    }
}