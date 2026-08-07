package com.sg.gamestopbackend.dto;

import java.time.LocalDateTime;

public class OtpDetails {
    private String otp;
    private LocalDateTime expiryTime;
    private LocalDateTime cooldownTime;
    private RegisterRequestDto registerRequestDto;

    public OtpDetails(String otp, LocalDateTime expiryTime, LocalDateTime cooldownTime, RegisterRequestDto registerRequestDto) {
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.cooldownTime = cooldownTime;
        this.registerRequestDto = registerRequestDto;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public LocalDateTime getCooldownTime() {
        return cooldownTime;
    }

    public void setCooldownTime(LocalDateTime cooldownTime) {
        this.cooldownTime = cooldownTime;
    }

    public RegisterRequestDto getRegisterRequestDto() {
        return registerRequestDto;
    }

    public void setRegisterRequestDto(RegisterRequestDto registerRequestDto) {
        this.registerRequestDto = registerRequestDto;
    }
}
