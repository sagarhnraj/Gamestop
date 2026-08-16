package com.sg.gamestopbackend.dto;

public class VoiceAssistantRequestDto {

    private String query;

    public VoiceAssistantRequestDto() {
    }

    public VoiceAssistantRequestDto(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
