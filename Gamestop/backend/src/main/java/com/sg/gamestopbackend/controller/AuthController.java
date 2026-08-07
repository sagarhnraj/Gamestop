package com.sg.gamestopbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.sg.gamestopbackend.dto.LoginRequestDto;
import com.sg.gamestopbackend.dto.LoginResponseDto;
import com.sg.gamestopbackend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.sg.gamestopbackend.service.OtpService otpService;

    public AuthController(AuthService authService, com.sg.gamestopbackend.service.OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto) {

        return ResponseEntity.ok(
                authService.login(loginRequestDto)
        );
    }

    @PostMapping("/register/initiate")
    public ResponseEntity<com.sg.gamestopbackend.dto.MessageResponseDto> initiateRegistration(
            @RequestBody com.sg.gamestopbackend.dto.RegisterRequestDto registerRequestDto) {
        return ResponseEntity.ok(otpService.initiateRegistration(registerRequestDto));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<com.sg.gamestopbackend.dto.MessageResponseDto> verifyOtp(
            @RequestBody com.sg.gamestopbackend.dto.OtpVerifyRequestDto otpVerifyRequestDto) {
        return ResponseEntity.ok(otpService.verifyOtp(otpVerifyRequestDto));
    }

    @PostMapping("/register/resend")
    public ResponseEntity<com.sg.gamestopbackend.dto.MessageResponseDto> resendOtp(
            @RequestBody java.util.Map<String, String> requestBody) {
        return ResponseEntity.ok(otpService.resendOtp(requestBody.get("email")));
    }

    @GetMapping("/test")
    public String test() {
        return "Auth Controller Working";
    }
}