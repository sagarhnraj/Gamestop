package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.UserDto;

public interface UserService {

    UserDto registerUser(UserDto userDto);

    UserDto getUserById(Integer userId);
}