package com.sg.gamestopbackend.dto;

public class VoiceSuggestionDto {

    private String label;
    private String query;

    public VoiceSuggestionDto() {
    }

    public VoiceSuggestionDto(String label, String query) {
        this.label = label;
        this.query = query;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
