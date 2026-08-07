package com.sg.gamestopbackend.service;

import com.sg.gamestopbackend.dto.MessageResponseDto;
import com.sg.gamestopbackend.dto.OtpVerifyRequestDto;
import com.sg.gamestopbackend.dto.RegisterRequestDto;

public interface OtpService {
    MessageResponseDto initiateRegistration(RegisterRequestDto request);
    MessageResponseDto verifyOtp(OtpVerifyRequestDto request);
    MessageResponseDto resendOtp(String email);
}
