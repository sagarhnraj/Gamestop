package com.sg.gamestopbackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sg.gamestopbackend.dto.UserDto;
import com.sg.gamestopbackend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserDto userDto) {

        UserDto savedUser = userService.registerUser(userDto);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

}