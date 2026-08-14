package com.sg.gamestopbackend.service.impl;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.dto.MessageResponseDto;
import com.sg.gamestopbackend.dto.OtpDetails;
import com.sg.gamestopbackend.dto.OtpVerifyRequestDto;
import com.sg.gamestopbackend.dto.RegisterRequestDto;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.OtpService;

@Service
public class OtpServiceImpl implements OtpService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    // In-memory storage for OTPs. 
    private final ConcurrentHashMap<String, OtpDetails> otpCache = new ConcurrentHashMap<>();

    public OtpServiceImpl(UserRepository userRepository, JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public MessageResponseDto initiateRegistration(RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new MessageResponseDto("Email is already registered.", false);
        }

        String otp = generateOtp();
        System.out.println("==========================================");
        System.out.println("GENERATED OTP FOR " + request.getEmail() + ": " + otp);
        System.out.println("==========================================");
        sendOtpEmail(request.getEmail(), otp);

        OtpDetails details = new OtpDetails(
                otp,
                LocalDateTime.now().plusMinutes(5),
                LocalDateTime.now().plusSeconds(60),
                request
        );

        otpCache.put(request.getEmail(), details);

        return new MessageResponseDto("OTP sent to your email! (OTP Code: " + otp + ")", true);
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

        // OTP valid, create user
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
             // In case username is duplicate, fallback to email as username
             user.setUsername(regData.getEmail());
             userRepository.save(user);
        }

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
        sendOtpEmail(email, newOtp);

        details.setOtp(newOtp);
        details.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        details.setCooldownTime(LocalDateTime.now().plusSeconds(60));

        otpCache.put(email, details);

        return new MessageResponseDto("A new OTP has been sent.", true);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("4gm22cs040@gmit.ac.in");
        message.setTo(to);
        message.setSubject("Your GameStop Registration OTP");
        message.setText("Your OTP for GameStop registration is: " + otp + "\n\nIt will expire in 5 minutes.");
        try {
            mailSender.send(message);
            System.out.println("SUCCESSFULLY DISPATCHED OTP EMAIL TO: " + to);
        } catch (Exception e) {
            System.err.println("FAILED TO SEND OTP EMAIL TO " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
