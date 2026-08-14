package com.sg.gamestopbackend.dto;

public class GoogleIdTokenRequestDto {

    private String idToken;

    public GoogleIdTokenRequestDto() {
    }

    public GoogleIdTokenRequestDto(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
