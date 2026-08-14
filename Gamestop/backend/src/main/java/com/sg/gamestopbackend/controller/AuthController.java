package com.sg.gamestopbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sg.gamestopbackend.dto.GoogleIdTokenRequestDto;
import com.sg.gamestopbackend.dto.LoginRequestDto;
import com.sg.gamestopbackend.dto.LoginResponseDto;
import com.sg.gamestopbackend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto) {

        return ResponseEntity.ok(
                authService.login(loginRequestDto)
        );
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponseDto> googleAuth(
            @RequestBody GoogleIdTokenRequestDto googleIdTokenRequestDto) {

        return ResponseEntity.ok(
                authService.loginOrRegisterWithGoogle(googleIdTokenRequestDto)
        );
    }

    @GetMapping("/test")
    public String test() {
        return "Auth Controller Working";
    }
}