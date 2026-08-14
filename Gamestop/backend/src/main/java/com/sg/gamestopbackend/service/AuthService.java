package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.LoginRequestDto;
import com.sg.gamestopbackend.dto.LoginResponseDto;

public interface AuthService {

    LoginResponseDto login(LoginRequestDto loginRequestDto);

    LoginResponseDto loginOrRegisterWithGoogle(com.sg.gamestopbackend.dto.GoogleIdTokenRequestDto googleIdTokenRequestDto);

    LoginResponseDto registerDirect(com.sg.gamestopbackend.dto.RegisterRequestDto registerRequestDto);

}