package com.sg.gamestopbackend.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        System.out.println("Searching for user: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));

        System.out.println("========== USER FOUND ==========");
        System.out.println("ID       : " + user.getUserId());
        System.out.println("Username : " + user.getUsername());
        System.out.println("Email    : " + user.getEmail());
        System.out.println("Password : " + user.getPassword());
        System.out.println("Role     : " + user.getRole());
        System.out.println("================================");

        String roleName = user.getRole();
        if (roleName == null || roleName.trim().isEmpty()) {
            roleName = "USER";
        }
        roleName = roleName.trim().toUpperCase();

        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(roleName));
        if (!roleName.startsWith("ROLE_")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        } else {
            authorities.add(new SimpleGrantedAuthority(roleName.substring(5)));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}