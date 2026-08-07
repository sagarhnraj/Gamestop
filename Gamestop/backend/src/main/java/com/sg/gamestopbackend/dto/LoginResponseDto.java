package com.sg.gamestopbackend.dto;

public class LoginResponseDto {

    private String token;
    private Integer userId;
    private String username;
    private String role;
    private String message;

    public LoginResponseDto() {
    }

    public LoginResponseDto(
            String token,
            Integer userId,
            String username,
            String role,
            String message) {

        this.token = token;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}