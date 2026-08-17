package com.sg.gamestopbackend.dto;

public class VoiceAssistantRequestDto {

    private String query;
    private String currentPage;
    private Integer currentProductId;
    private Integer lastSearchResultProductId;

    public VoiceAssistantRequestDto() {
    }

    public VoiceAssistantRequestDto(String query) {
        this.query = query;
    }

    public VoiceAssistantRequestDto(String query, String currentPage, Integer currentProductId) {
        this.query = query;
        this.currentPage = currentPage;
        this.currentProductId = currentProductId;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(String currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getCurrentProductId() {
        return currentProductId;
    }

    public void setCurrentProductId(Integer currentProductId) {
        this.currentProductId = currentProductId;
    }

    public Integer getLastSearchResultProductId() {
        return lastSearchResultProductId;
    }

    public void setLastSearchResultProductId(Integer lastSearchResultProductId) {
        this.lastSearchResultProductId = lastSearchResultProductId;
    }
}
