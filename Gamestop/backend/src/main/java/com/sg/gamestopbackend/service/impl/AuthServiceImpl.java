package com.sg.gamestopbackend.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import com.sg.gamestopbackend.dto.GoogleIdTokenRequestDto;
import com.sg.gamestopbackend.dto.LoginRequestDto;
import com.sg.gamestopbackend.dto.LoginResponseDto;
import com.sg.gamestopbackend.dto.RegisterRequestDto;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.security.jwt.JwtService;
import com.sg.gamestopbackend.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client.id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPassword()));

        User user = userRepository
                .findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String token = jwtService.generateToken(authentication.getName());

        return new LoginResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole(),
                "Login Successful");
    }

    @Override
    @Transactional
    public LoginResponseDto loginOrRegisterWithGoogle(GoogleIdTokenRequestDto googleIdTokenRequestDto) {
        if (googleIdTokenRequestDto == null || googleIdTokenRequestDto.getIdToken() == null || googleIdTokenRequestDto.getIdToken().isBlank()) {
            throw new IllegalArgumentException("Google ID Token is required");
        }

        String rawToken = googleIdTokenRequestDto.getIdToken().trim();
        String googleEmail = null;
        String googleName = null;

        try {
            GoogleIdTokenVerifier verifier;
            String clientId = (googleClientId != null && !googleClientId.isBlank()) ? googleClientId.trim() : System.getenv("GOOGLE_CLIENT_ID");

            if (clientId != null && !clientId.isBlank()) {
                verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(clientId.trim()))
                        .build();
            } else {
                verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .build();
            }

            GoogleIdToken idToken = verifier.verify(rawToken);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                googleEmail = payload.getEmail();
                googleName = (String) payload.get("name");
            } else {
                throw new IllegalArgumentException("Invalid Google ID token signature or token expired");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Google ID Token verification failed: " + e.getMessage());
        }

        if (googleEmail == null || googleEmail.isBlank()) {
            throw new IllegalArgumentException("Could not extract verified email from Google ID Token");
        }

        final String targetEmail = googleEmail.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmail(targetEmail);

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            // Existing user - preserve their role (ROLE_ADMIN or ROLE_USER) unchanged!
        } else {
            // New user registration via Google - ALWAYS set role to ROLE_USER
            String baseUsername = (googleName != null && !googleName.isBlank()) ? googleName.trim() : targetEmail.split("@")[0];
            String username = baseUsername;
            int counter = 1;
            while (userRepository.findByUsername(username).isPresent()) {
                username = baseUsername + counter;
                counter++;
            }

            user = new User();
            user.setEmail(targetEmail);
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Secure random password
            user.setRole("ROLE_USER");
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            user = userRepository.save(user);
        }

        // Generate GameStop JWT token for the authenticated user
        String jwtToken = jwtService.generateToken(user.getEmail());

        return new LoginResponseDto(
                jwtToken,
                user.getUserId(),
                user.getUsername(),
                user.getRole(),
                "Google Authentication Successful");
    }

    @Override
    @Transactional
    public LoginResponseDto registerDirect(RegisterRequestDto registerRequestDto) {
        if (registerRequestDto == null || registerRequestDto.getEmail() == null || registerRequestDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required for registration");
        }

        String email = registerRequestDto.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered. Please login.");
        }

        String firstName = registerRequestDto.getFirstName() != null ? registerRequestDto.getFirstName().trim() : "";
        String lastName = registerRequestDto.getLastName() != null ? registerRequestDto.getLastName().trim() : "";
        String baseUsername = (firstName + " " + lastName).trim();
        if (baseUsername.isEmpty()) {
            baseUsername = email.split("@")[0];
        }

        String username = baseUsername;
        int counter = 1;
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));
        newUser.setRole("ROLE_USER");
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(savedUser.getEmail());

        return new LoginResponseDto(
                jwtToken,
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                "Registration Successful");
    }
}