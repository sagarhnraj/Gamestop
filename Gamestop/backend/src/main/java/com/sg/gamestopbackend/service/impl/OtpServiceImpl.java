package com.sg.gamestopbackend.service.impl;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.dto.MessageResponseDto;
import com.sg.gamestopbackend.dto.OtpDetails;
import com.sg.gamestopbackend.dto.OtpVerifyRequestDto;
import com.sg.gamestopbackend.dto.RegisterRequestDto;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.OtpService;
import com.sg.gamestopbackend.service.ResendEmailService;

@Service
public class OtpServiceImpl implements OtpService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResendEmailService resendEmailService;

    // In-memory temporary storage for pending registrations & 5-minute OTPs.
    private final ConcurrentHashMap<String, OtpDetails> otpCache = new ConcurrentHashMap<>();

    @Autowired
    public OtpServiceImpl(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          ResendEmailService resendEmailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.resendEmailService = resendEmailService;
    }

    @Override
    public MessageResponseDto initiateRegistration(RegisterRequestDto request) {
        // 1. Validate if user is already registered in DB
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new MessageResponseDto("Email is already registered.", false);
        }

        // 2. Generate 6-digit OTP
        String otp = generateOtp();

        // 3. Send OTP via Resend HTTPS REST API (Port 443 - works on Render Free Web Services)
        boolean sent = resendEmailService.sendOtpEmail(request.getEmail(), otp);

        if (!sent) {
            return new MessageResponseDto("Failed to send OTP email. Please ensure RESEND_API_KEY is configured on Render.", false);
        }

        // 4. Safely store/update pending registration data & 5-minute OTP in memory
        OtpDetails details = new OtpDetails(
                otp,
                LocalDateTime.now().plusMinutes(5),
                LocalDateTime.now().plusSeconds(60),
                request
        );
        otpCache.put(request.getEmail(), details);

        return new MessageResponseDto("OTP sent to your email. Please check your inbox.", true);
    }

    @Override
    public MessageResponseDto verifyOtp(OtpVerifyRequestDto request) {
        OtpDetails details = otpCache.get(request.getEmail());

        if (details == null) {
            return new MessageResponseDto("OTP not found or expired. Please register again.", false);
        }

        if (LocalDateTime.now().isAfter(details.getExpiryTime())) {
            otpCache.remove(request.getEmail());
            return new MessageResponseDto("OTP has expired. Please request a new one.", false);
        }

        if (!details.getOtp().equals(request.getOtp())) {
            return new MessageResponseDto("Invalid OTP.", false);
        }

        // OTP is valid! Save user to database now.
        RegisterRequestDto regData = details.getRegisterRequestDto();
        
        User user = new User();
        user.setUsername(regData.getFirstName() + " " + regData.getLastName());
        user.setEmail(regData.getEmail());
        user.setPassword(passwordEncoder.encode(regData.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        try {
            userRepository.save(user);
        } catch (Exception e) {
             user.setUsername(regData.getEmail());
             userRepository.save(user);
        }

        // Evict temporary OTP and pending registration data immediately
        otpCache.remove(request.getEmail());

        return new MessageResponseDto("Registration successful. You can now login.", true);
    }

    @Override
    public MessageResponseDto resendOtp(String email) {
        OtpDetails details = otpCache.get(email);

        if (details == null) {
            return new MessageResponseDto("No pending registration found for this email.", false);
        }

        if (LocalDateTime.now().isBefore(details.getCooldownTime())) {
            return new MessageResponseDto("Please wait before requesting another OTP.", false);
        }

        String newOtp = generateOtp();
        boolean sent = resendEmailService.sendOtpEmail(email, newOtp);

        if (!sent) {
            return new MessageResponseDto("Failed to send new OTP email. Please try again later.", false);
        }

        details.setOtp(newOtp);
        details.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        details.setCooldownTime(LocalDateTime.now().plusSeconds(60));

        otpCache.put(email, details);

        return new MessageResponseDto("A new OTP has been sent to your email.", true);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
