package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.GoogleIdTokenRequestDto;
import com.sg.gamestopbackend.dto.LoginRequestDto;
import com.sg.gamestopbackend.dto.LoginResponseDto;

public interface AuthService {

    LoginResponseDto login(LoginRequestDto loginRequestDto);

    LoginResponseDto loginOrRegisterWithGoogle(GoogleIdTokenRequestDto googleIdTokenRequestDto);
}