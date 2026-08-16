package com.sg.gamestopbackend.dto;

public class GoogleIdTokenRequestDto {

    private String idToken;
    private String enteredEmail;
    private String firstName;
    private String lastName;
    private String password;

    public GoogleIdTokenRequestDto() {
    }

    public GoogleIdTokenRequestDto(String idToken) {
        this.idToken = idToken;
    }

    public GoogleIdTokenRequestDto(String idToken, String enteredEmail, String firstName, String lastName) {
        this.idToken = idToken;
        this.enteredEmail = enteredEmail;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public GoogleIdTokenRequestDto(String idToken, String enteredEmail, String firstName, String lastName, String password) {
        this.idToken = idToken;
        this.enteredEmail = enteredEmail;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getEnteredEmail() {
        return enteredEmail;
    }

    public void setEnteredEmail(String enteredEmail) {
        this.enteredEmail = enteredEmail;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
