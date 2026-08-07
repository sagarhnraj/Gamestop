package com.sg.gamestopbackend.dto;

public class LoginResponseDto {

    private String token;
    private Integer userId;
    private String username;
    private String message;

    public LoginResponseDto() {
    }

    public LoginResponseDto(
            String token,
            Integer userId,
            String username,
            String message) {

        this.token = token;
        this.userId = userId;
        this.username = username;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}